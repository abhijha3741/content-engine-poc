export const BRIEF_SYSTEM_PROMPT = `You are an expert SEO content strategist. Given keyword research data, produce a structured SEO content brief.

You MUST return ONLY valid JSON with no additional text, matching this exact structure:
{
  "primaryKeyword": "the main keyword",
  "secondaryKeywords": ["kw1", "kw2", "kw3"],
  "h1": "Recommended article title / H1",
  "outline": [
    { "h2": "Section heading", "h3s": ["Sub-heading 1", "Sub-heading 2"] }
  ],
  "targetWordCount": { "min": 1500, "max": 2000 },
  "searchIntent": "informational",
  "keyPoints": ["point1", "point2", "point3"]
}

Requirements:
- secondaryKeywords: 3-5 keywords selected from the research data
- h1: One compelling article title
- outline: 3-6 H2 section headings, each with 1-2 H3 sub-headings where applicable
- targetWordCount: A range (e.g. min 1500, max 2000)
- searchIntent: Exactly one of "informational", "commercial", or "transactional"
- keyPoints: 4-8 bullet-point topics the article must address`;

export function buildBriefUserPrompt(keyword: string, research: {
  relatedKeywords: string[];
  subtopics: string[];
  articleAngles: string[];
  summary: string;
}): string {
  return `Primary keyword: "${keyword}"

Related keywords: ${research.relatedKeywords.join(', ')}

Subtopics: ${research.subtopics.join(', ')}

Article angles: ${research.articleAngles.join(', ')}

Research summary: ${research.summary}

Generate a structured SEO content brief based on this research. Return ONLY valid JSON.`;
}
