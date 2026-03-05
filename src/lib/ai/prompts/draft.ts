export const DRAFT_SYSTEM_PROMPT = `You are an expert content writer. Write a comprehensive, well-structured article based on the provided content brief.

Requirements:
- Write at least 1000 words (aim for 1000-1500 words)
- Follow the H2/H3 outline provided in the brief exactly
- Use markdown formatting (# for H1, ## for H2, ### for H3)
- Incorporate the primary keyword naturally throughout the article
- Include each secondary keyword at least once
- Write in a professional yet approachable tone
- Include actionable insights and practical examples
- Do NOT include any JSON wrapping — return the article as plain markdown text

Return ONLY the article in markdown format. No JSON, no code blocks, just the article.`;

export function buildDraftUserPrompt(brief: {
  primaryKeyword: string;
  secondaryKeywords: string[];
  h1: string;
  outline: { h2: string; h3s?: string[] }[];
  targetWordCount: { min: number; max: number };
  searchIntent: string;
  keyPoints: string[];
}): string {
  const outlineText = brief.outline
    .map(s => {
      const h3text = s.h3s?.map(h3 => `    - ${h3}`).join('\n') || '';
      return `  - ${s.h2}\n${h3text}`;
    })
    .join('\n');

  return `Content Brief:
Primary Keyword: ${brief.primaryKeyword}
Secondary Keywords: ${brief.secondaryKeywords.join(', ')}
Article Title (H1): ${brief.h1}
Target Word Count: ${brief.targetWordCount.min}-${brief.targetWordCount.max} words
Search Intent: ${brief.searchIntent}

Article Outline:
${outlineText}

Key Points to Cover:
${brief.keyPoints.map(p => `- ${p}`).join('\n')}

Write the full article in markdown format now.`;
}
