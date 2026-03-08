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

/**
 * AI complete with automatic JSON retry — retries up to 2 times if JSON parsing fails.
 */
export async function aiCompleteJson<T>(opts: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const prompt =
      attempt === 0
        ? opts.userPrompt
        : `${opts.userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. You MUST respond with ONLY a valid JSON object. Start with { and end with }. No text before or after.`;

    const raw = await aiComplete({
      ...opts,
      userPrompt: prompt,
      temperature: attempt === 0 ? opts.temperature : 0.3, // Lower temp on retry
    });

    try {
      return parseJsonResponse<T>(raw);
    } catch (err) {
      if (attempt === maxRetries) {
        const preview = raw.slice(0, 300).replace(/\n/g, ' ');
        throw new Error(
          `Failed to parse AI JSON after ${maxRetries + 1} attempts. Response preview: "${preview}"`
        );
      }
      // Continue to retry
    }
  }

  throw new Error('Unexpected: exhausted retries');
}

/**
 * Clean common JSON issues from AI responses
 */
function cleanJsonString(str: string): string {
  return str
    // Remove trailing commas before } or ]
    .replace(/,\s*([\]}])/g, '$1')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Find the outermost matching brace pair in a string
 */
function extractOutermostJson(str: string): string | null {
  const startIdx = str.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return str.slice(startIdx, i + 1);
      }
    }
  }

  return null;
}

export function parseJsonResponse<T>(raw: string): T {
  // Step 1: Strip markdown code fences
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Step 2: Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Step 3: Try cleaning common issues then parsing
  try {
    return JSON.parse(cleanJsonString(cleaned));
  } catch {
    // continue
  }

  // Step 4: Extract outermost JSON object using brace matching
  const extracted = extractOutermostJson(cleaned);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch {
      // Try with cleaning
      try {
        return JSON.parse(cleanJsonString(extracted));
      } catch {
        // continue
      }
    }
  }

  // Step 5: Try raw input (before fence stripping) in case fence stripping broke it
  const rawExtracted = extractOutermostJson(raw);
  if (rawExtracted && rawExtracted !== extracted) {
    try {
      return JSON.parse(cleanJsonString(rawExtracted));
    } catch {
      // continue
    }
  }

  // Step 6: Last resort — try to find array
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(cleanJsonString(arrayMatch[0]));
    } catch {
      // continue
    }
  }

  const preview = raw.slice(0, 200).replace(/\n/g, ' ');
  throw new Error(`Failed to parse AI response as JSON. Preview: "${preview}"`);
}
