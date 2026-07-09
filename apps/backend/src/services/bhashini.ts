// Bhashini integration — translation + speech-to-text (ASR) for Indian languages.
//
// Bhashini works in two hops:
//   1. A "config" call to the ULCA auth host resolves, for a given task chain and
//      language pair, which model `serviceId` to use plus a short-lived Dhruva
//      inference endpoint + Authorization token.
//   2. A "compute" call to that Dhruva endpoint runs the actual inference.
//
// The config response is stable per (task, language pair) so we cache it in Redis
// to save a round-trip on every request. Mirrors the service pattern in groq.ts.

import { cacheGet, cacheSet } from '../db/redis';

const CONFIG_ENDPOINT =
  'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';

// Public MeitY pipeline. Override via env if you have a dedicated pipeline.
const PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd';

// Config lookups are cached for a day — the model→serviceId mapping rarely moves.
const CONFIG_CACHE_TTL = 86400;

/**
 * Languages supported by the MeitY pipeline: the 22 scheduled Indian languages
 * (ISO 639 codes as Bhashini expects them) plus English. Not every pair has a
 * model for every task — resolveConfig surfaces a clear error when one is missing.
 */
export const SUPPORTED_LANGUAGES: Record<string, string> = {
  as: 'Assamese',
  bn: 'Bengali',
  brx: 'Bodo',
  doi: 'Dogri',
  en: 'English',
  gu: 'Gujarati',
  hi: 'Hindi',
  kn: 'Kannada',
  ks: 'Kashmiri',
  gom: 'Konkani',
  mai: 'Maithili',
  ml: 'Malayalam',
  mni: 'Manipuri',
  mr: 'Marathi',
  ne: 'Nepali',
  or: 'Odia',
  pa: 'Punjabi',
  sa: 'Sanskrit',
  sat: 'Santali',
  sd: 'Sindhi',
  ta: 'Tamil',
  te: 'Telugu',
  ur: 'Urdu',
};

export function isSupportedLanguage(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, code);
}

/**
 * Thrown when a Bhashini config/compute call fails or credentials are missing.
 * The route layer maps this to a 502 (upstream failure) rather than a 500.
 */
export class BhashiniError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BhashiniError';
  }
}

type TaskType = 'asr' | 'translation';

// Shapes we read out of the config response. Only the fields we consume are typed.
interface ResolvedConfig {
  serviceId: string;
  callbackUrl: string;
  authHeaderName: string;
  authHeaderValue: string;
}

function requireCredentials(): { userID: string; ulcaApiKey: string } {
  const userID = process.env.BHASHINI_USER_ID;
  const ulcaApiKey = process.env.BHASHINI_API_KEY;
  if (!userID || !ulcaApiKey) {
    throw new BhashiniError(
      'Bhashini is not configured — set BHASHINI_USER_ID and BHASHINI_API_KEY'
    );
  }
  return { userID, ulcaApiKey };
}

/**
 * Resolves the serviceId + Dhruva endpoint for a task and language pair, caching
 * the result. `target` is omitted for ASR (single source language).
 */
async function resolveConfig(
  task: TaskType,
  source: string,
  target?: string
): Promise<ResolvedConfig> {
  const cacheKey = `bhashini:cfg:${task}:${source}:${target ?? ''}`;
  const cached = await cacheGet<ResolvedConfig>(cacheKey);
  if (cached) return cached;

  const { userID, ulcaApiKey } = requireCredentials();

  const language: Record<string, string> = { sourceLanguage: source };
  if (task === 'translation' && target) language.targetLanguage = target;

  const body = {
    pipelineTasks: [{ taskType: task, config: { language } }],
    pipelineRequestConfig: { pipelineId: PIPELINE_ID },
  };

  let json: any;
  try {
    const res = await fetch(CONFIG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID,
        ulcaApiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new BhashiniError(`config call returned HTTP ${res.status}`);
    }
    json = await res.json();
  } catch (err) {
    if (err instanceof BhashiniError) throw err;
    const message = err instanceof Error ? err.message : 'unknown error';
    throw new BhashiniError(`Bhashini config request failed: ${message}`);
  }

  const serviceId: string | undefined =
    json?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;
  const endpoint = json?.pipelineInferenceAPIEndPoint;
  const callbackUrl: string | undefined = endpoint?.callbackUrl;
  const authHeaderName: string | undefined = endpoint?.inferenceApiKey?.name;
  const authHeaderValue: string | undefined = endpoint?.inferenceApiKey?.value;

  if (!serviceId || !callbackUrl || !authHeaderName || !authHeaderValue) {
    throw new BhashiniError(
      `no ${task} model available for ${source}${target ? `→${target}` : ''}`
    );
  }

  const resolved: ResolvedConfig = {
    serviceId,
    callbackUrl,
    authHeaderName,
    authHeaderValue,
  };
  await cacheSet(cacheKey, resolved, CONFIG_CACHE_TTL);
  return resolved;
}

// Runs a compute call against the resolved Dhruva endpoint and returns the raw
// pipelineResponse array so each caller can pull out text/audio as needed.
async function compute(cfg: ResolvedConfig, payload: unknown): Promise<any> {
  let json: any;
  try {
    const res = await fetch(cfg.callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [cfg.authHeaderName]: cfg.authHeaderValue,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new BhashiniError(`compute call returned HTTP ${res.status}`);
    }
    json = await res.json();
  } catch (err) {
    if (err instanceof BhashiniError) throw err;
    const message = err instanceof Error ? err.message : 'unknown error';
    throw new BhashiniError(`Bhashini compute request failed: ${message}`);
  }
  return json;
}

export interface TranslationResult {
  source: string;
  target: string;
  sourceText: string;
  translatedText: string;
}

/**
 * Translates text from one Indian language to another. Text-level results are
 * cached so repeated phrases (UI strings, common queries) skip the round-trip.
 */
export async function translate(
  text: string,
  source: string,
  target: string
): Promise<TranslationResult> {
  if (!isSupportedLanguage(source)) {
    throw new BhashiniError(`unsupported source language: ${source}`);
  }
  if (!isSupportedLanguage(target)) {
    throw new BhashiniError(`unsupported target language: ${target}`);
  }
  if (source === target) {
    return { source, target, sourceText: text, translatedText: text };
  }

  const textCacheKey = `bhashini:tr:${source}:${target}:${text}`;
  const cachedText = await cacheGet<TranslationResult>(textCacheKey);
  if (cachedText) return cachedText;

  const cfg = await resolveConfig('translation', source, target);

  const payload = {
    pipelineTasks: [
      {
        taskType: 'translation',
        config: {
          language: { sourceLanguage: source, targetLanguage: target },
          serviceId: cfg.serviceId,
        },
      },
    ],
    inputData: { input: [{ source: text }] },
  };

  const json = await compute(cfg, payload);
  const translatedText: string | undefined =
    json?.pipelineResponse?.[0]?.output?.[0]?.target;

  if (typeof translatedText !== 'string') {
    throw new BhashiniError('Bhashini translation returned no output');
  }

  const result: TranslationResult = {
    source,
    target,
    sourceText: text,
    translatedText,
  };
  await cacheSet(textCacheKey, result, CONFIG_CACHE_TTL);
  return result;
}

export interface TranscriptionResult {
  language: string;
  text: string;
}

/**
 * Transcribes base64-encoded audio in the given source language (speech-to-text).
 * ASR output is inherently per-recording so it is not cached.
 */
export async function transcribe(
  audioBase64: string,
  source: string,
  audioFormat: string = 'wav',
  samplingRate: number = 16000
): Promise<TranscriptionResult> {
  if (!isSupportedLanguage(source)) {
    throw new BhashiniError(`unsupported source language: ${source}`);
  }

  const cfg = await resolveConfig('asr', source);

  const payload = {
    pipelineTasks: [
      {
        taskType: 'asr',
        config: {
          language: { sourceLanguage: source },
          serviceId: cfg.serviceId,
          audioFormat,
          samplingRate,
        },
      },
    ],
    inputData: { audio: [{ audioContent: audioBase64 }] },
  };

  const json = await compute(cfg, payload);
  const text: string | undefined = json?.pipelineResponse?.[0]?.output?.[0]?.source;

  if (typeof text !== 'string') {
    throw new BhashiniError('Bhashini ASR returned no output');
  }

  return { language: source, text };
}

/**
 * Speech-to-text followed by translation: transcribe audio in `source`, then
 * translate the transcript into `target`. This is the "translates once text is
 * parsed" flow. Returns both the transcript and its translation.
 */
export async function transcribeAndTranslate(
  audioBase64: string,
  source: string,
  target: string,
  audioFormat: string = 'wav',
  samplingRate: number = 16000
): Promise<{ transcript: TranscriptionResult; translation: TranslationResult }> {
  const transcript = await transcribe(audioBase64, source, audioFormat, samplingRate);
  const translation = await translate(transcript.text, source, target);
  return { transcript, translation };
}
