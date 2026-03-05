import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

const MODEL = process.env.AI_MODEL || 'google/gemini-2.5-flash-lite';

export async function aiComplete(opts: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000 } = opts;

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI returned empty response');
  }
  return content;
}

export function parseJsonResponse<T>(raw: string): T {
  // Try to extract JSON from the response
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const toParse = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  // Try parsing directly
  try {
    return JSON.parse(toParse);
  } catch {
    // Try to find JSON object or array in the text
    const objectMatch = toParse.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    const arrayMatch = toParse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}
