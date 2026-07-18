import { apiGet } from "../http";
import type { Story } from "../contracts";

/**
 * GET /ai/story?state=<state> — AI-generated narration for an Indian state.
 * The backend caches results, but generation can still take a few seconds on a
 * cold cache, so allow a longer timeout than the default.
 */
export async function getStory(state: string, signal?: AbortSignal): Promise<Story> {
  return apiGet<Story>("/ai/story", { state }, { signal, timeoutMs: 45_000 });
}
