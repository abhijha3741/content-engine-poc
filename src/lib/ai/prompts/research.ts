export const RESEARCH_SYSTEM_PROMPT = `You are an expert SEO researcher and content strategist. Given a primary keyword or topic, produce structured keyword research output.

You MUST return ONLY valid JSON with no additional text, matching this exact structure:
{
  "relatedKeywords": ["keyword1", "keyword2", ...],
  "subtopics": ["subtopic1", "subtopic2", ...],
  "articleAngles": ["angle1", "angle2", ...],
  "summary": "Brief 2-3 sentence description of the keyword landscape"
}

Requirements:
- relatedKeywords: 5-10 semantically related keywords or phrases (distinct from the primary keyword)
- subtopics: 3-5 subtopics that branch from the primary keyword
- articleAngles: 3-5 distinct article title variations or angles
- summary: 2-3 sentences describing the keyword landscape and opportunity`;

export function buildResearchUserPrompt(keyword: string): string {
  return `Primary keyword: "${keyword}"

Generate comprehensive keyword research for this topic. Return ONLY valid JSON.`;
}
