import { groq } from './groq';

export class TranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslationError';
  }
}

/**
 * Translates text from sourceLang to targetLang using Groq.
 */
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Return ONLY the translated text, with no markdown, no quotes, and no preamble:\n\n${text}`;
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.1,
    });
    
    const translated = completion.choices[0]?.message?.content?.trim();
    if (translated) {
      return translated;
    }
  } catch (err) {
    console.error(`[translation] Groq translation failed for ${sourceLang} -> ${targetLang}:`, err);
  }
  
  throw new TranslationError('Translation service failed.');
}
