/**
 * Core HTTP client for the Aaroh backend.
 *
 * A single low-level `request()` helper that every endpoint module builds on:
 *  - base URL from EXPO_PUBLIC_API_URL (falls back to localhost)
 *  - query-string building with encoding
 *  - JSON body serialisation
 *  - per-request timeout via AbortController (merged with any caller signal)
 *  - uniform error handling through the typed `ApiError`
 *
 * This file is UI-agnostic and has no React dependency.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

const DEFAULT_TIMEOUT_MS = 10_000;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface RequestOptions {
  method?: HttpMethod;
  /** Query params — nullish values are skipped, everything else is stringified + encoded. */
  params?: QueryParams;
  /** Request body — plain objects are JSON-serialised automatically. */
  body?: unknown;
  headers?: Record<string, string>;
  /** External abort signal (e.g. from a React hook) — merged with the timeout. */
  signal?: AbortSignal;
  /** Per-request timeout; defaults to 10s. Pass 0 to disable. */
  timeoutMs?: number;
}

/**
 * Every failure from this layer is an ApiError, so callers only catch one type.
 *  - `status === 0`  → network failure / no response (see `isNetworkError`)
 *  - `isTimeout`     → the request exceeded its timeout
 *  - `isAbort`       → the caller cancelled it
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: unknown;
  readonly isTimeout: boolean;
  readonly isAbort: boolean;

  constructor(
    message: string,
    status: number,
    opts: { detail?: unknown; isTimeout?: boolean; isAbort?: boolean } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = opts.detail;
    this.isTimeout = opts.isTimeout ?? false;
    this.isAbort = opts.isAbort ?? false;
  }

  /** True when the request never reached the server (offline, DNS, CORS, etc.). */
  get isNetworkError(): boolean {
    return this.status === 0 && !this.isTimeout && !this.isAbort;
  }

  /** True for 4xx responses (client-side / validation errors). */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

function buildUrl(path: string, params?: QueryParams): string {
  const base = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return base;

  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");

  return qs ? `${base}?${qs}` : base;
}

/** Links a timeout and an optional external signal into one AbortController. */
function makeSignal(
  external: AbortSignal | undefined,
  timeoutMs: number
): { signal: AbortSignal; cleanup: () => void; timedOut: () => boolean } {
  const controller = new AbortController();
  let timedOut = false;

  const onExternalAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", onExternalAbort);
  }

  const timer =
    timeoutMs > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeoutMs)
      : null;

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup: () => {
      if (timer) clearTimeout(timer);
      external?.removeEventListener("abort", onExternalAbort);
    },
  };
}

/**
 * Performs an HTTP request and returns the parsed JSON body as `T`.
 * Throws {@link ApiError} for non-2xx responses, timeouts, aborts and network
 * failures. `T` is trusted from the caller — validate at the edge if needed.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    params,
    body,
    headers,
    signal: externalSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const url = buildUrl(path, params);
  const { signal, cleanup, timedOut } = makeSignal(externalSignal, timeoutMs);

  const init: RequestInit = { method, signal, headers: { ...headers } };

  if (body !== undefined && body !== null) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    cleanup();
    if (timedOut()) {
      throw new ApiError(`Request to ${path} timed out`, 0, { isTimeout: true });
    }
    if (externalSignal?.aborted) {
      throw new ApiError(`Request to ${path} was cancelled`, 0, { isAbort: true });
    }
    throw new ApiError(
      `Network request to ${path} failed`,
      0,
      { detail: err instanceof Error ? err.message : err }
    );
  } finally {
    cleanup();
  }

  // Parse the body once — some endpoints return empty responses.
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      (isRecord(data) && typeof data.error === "string" && data.error) ||
      `Request to ${path} failed with ${res.status}`;
    throw new ApiError(message, res.status, {
      detail: isRecord(data) ? data.detail ?? data : data,
    });
  }

  return data as T;
}

/** Convenience GET returning JSON as `T`. */
export function apiGet<T>(
  path: string,
  params?: QueryParams,
  options?: Omit<RequestOptions, "method" | "params" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "GET", params });
}

/** Convenience POST with a JSON body, returning JSON as `T`. */
export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body });
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
