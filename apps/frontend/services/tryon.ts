/**
 * AI virtual try-on via kie.ai's Nano Banana (Gemini image) model.
 *
 * Runs client-side using EXPO_PUBLIC_KIE_API_KEY. kie.ai is pay-as-you-go
 * (~$0.04+/image) with free trial credits on signup. Nano Banana handles full
 * outfits (incl. the lower body) far better than the free try-on Spaces.
 *
 * Flow: POST createTask -> poll recordInfo until state === "success".
 * Get a key at https://kie.ai (dashboard → API keys) and add to
 * apps/frontend/.env:  EXPO_PUBLIC_KIE_API_KEY=...
 */

const KIE_KEY = process.env.EXPO_PUBLIC_KIE_API_KEY;

// "google/nano-banana-edit" (Nano Banana 2, cheapest) or "google/nano-banana-pro"
// (Gemini 3 Pro Image, best quality) — swap this one constant to upgrade.
const MODEL = "google/nano-banana-edit";

const CREATE_URL = "https://api.kie.ai/api/v1/jobs/createTask";
const QUERY_URL = "https://api.kie.ai/api/v1/jobs/recordInfo";
const UPLOAD_URL = "https://kieai.redpandaai.co/api/file-base64-upload";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

export class TryOnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TryOnError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// kie.ai only accepts image URLs (not data: URIs), so local photos are uploaded
// to kie.ai's temp storage first. Public http(s) URLs pass straight through.
async function ensurePublicUrl(ref: string): Promise<string> {
  if (!ref.startsWith("data:")) return ref;
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Data: ref, uploadPath: "images/tryon" }),
  });
  const json = await res.json().catch(() => null);
  const url = json?.data?.downloadUrl;
  if (!url) {
    throw new TryOnError(json?.msg ?? "Couldn't upload your photo. Please try again.");
  }
  return url as string;
}

/**
 * `humanImage` and `garmentImage` are each an https URL or a data: URI.
 * `category` (e.g. "Sarees") is woven into the prompt. Returns the result URL.
 */
export async function generateTryOn(
  humanImage: string,
  garmentImage: string,
  category: string
): Promise<string> {
  if (!KIE_KEY) {
    throw new TryOnError(
      "Add your kie.ai API key: create one at kie.ai and set EXPO_PUBLIC_KIE_API_KEY in apps/frontend/.env."
    );
  }

  const prompt =
    `Photorealistic virtual try-on. The FIRST image is a person; the SECOND image is a ${category} outfit. ` +
    `Generate one image of the SAME person wearing that outfit. Preserve their face, skin tone, hair, ` +
    `body shape and pose exactly. Show a natural full-body result with realistic clothing fit, correct ` +
    `draping of the lower garment, natural lighting and a clean background. Output only the image.`;

  // Upload any local (data:) images so kie.ai receives plain URLs.
  const personUrl = await ensurePublicUrl(humanImage);
  const garmentUrl = await ensurePublicUrl(garmentImage);

  // 1. Create the task.
  let taskId: string;
  try {
    const res = await fetch(CREATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KIE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: {
          prompt,
          image_urls: [personUrl, garmentUrl],
          output_format: "png",
          aspect_ratio: "3:4",
        },
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.code !== 200) {
      throw new TryOnError(json?.msg ?? `Couldn't start the try-on (${res.status}).`);
    }
    taskId = json?.data?.taskId;
    if (!taskId) throw new TryOnError("kie.ai didn't return a task id.");
  } catch (err) {
    if (err instanceof TryOnError) throw err;
    throw new TryOnError(err instanceof Error ? err.message : "Network error contacting kie.ai.");
  }

  // 2. Poll for the result.
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    let json: any;
    try {
      const res = await fetch(`${QUERY_URL}?taskId=${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${KIE_KEY}` },
      });
      json = await res.json().catch(() => null);
    } catch {
      continue; // transient — keep polling
    }

    const state = json?.data?.state;
    if (state === "success") {
      let urls: string[] = [];
      try {
        urls = JSON.parse(json.data.resultJson ?? "{}").resultUrls ?? [];
      } catch {}
      const url = urls[0];
      if (!url) throw new TryOnError("The try-on finished but returned no image.");
      return url;
    }
    if (state === "fail") {
      throw new TryOnError(json?.data?.failMsg ?? "The try-on failed. Try clearer images.");
    }
  }

  throw new TryOnError("The try-on is taking too long. Please try again.");
}
