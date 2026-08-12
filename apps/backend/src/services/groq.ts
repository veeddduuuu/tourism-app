import Groq from 'groq-sdk';

/** Thrown when the story model fails or returns unparseable output → 502. */
export class StoryGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoryGenerationError';
  }
}

export interface StoryContent {
  title: string;
  monument: string;
  narration: string;
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STORY_SYSTEM_PROMPT = `You are a master storyteller who narrates the history, culture and spirit of Indian states as an immersive audio experience.
Given an Indian state, respond ONLY with a JSON object in this exact format:
{
  "title": "string — an evocative title for the story",
  "monument": "string — one iconic monument or landmark of that state",
  "narration": "string — a vivid second-person narration of 150-250 words that opens by inviting the listener to close their eyes and imagine the scene, then tells the state's most compelling historical or cultural story in short, flowing sentences"
}
No preamble, no markdown — only valid JSON.`;

/**
 * Generates an AI narration for an Indian state via Groq's Llama 3.3 70B model.
 * Throws StoryGenerationError on an empty response or invalid JSON.
 */
export async function generateStory(state: string): Promise<StoryContent> {
  const userPrompt = `Tell the story of the Indian state of ${state}.`;

  let content: string | null;
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: STORY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    content = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    throw new StoryGenerationError(`Groq request failed: ${message}`);
  }

  if (!content) {
    throw new StoryGenerationError('Groq returned an empty response');
  }

  try {
    return JSON.parse(content) as StoryContent;
  } catch {
    throw new StoryGenerationError('Groq returned invalid JSON');
  }
}
