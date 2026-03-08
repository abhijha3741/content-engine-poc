export const EEAT_AUDIT_SYSTEM_PROMPT = `You are an expert SEO content auditor specializing in Google's E-E-A-T framework.

Analyze the provided article draft and produce an E-E-A-T audit report.

CRITICAL: You MUST respond with ONLY valid JSON. No text, explanation, or commentary before or after the JSON. Start your response with \`{\` and end with \`}\`.

Required JSON structure:
{
  "audit": {
    "experience": { "rating": "Weak", "suggestions": ["suggestion1", "suggestion2"] },
    "expertise": { "rating": "Moderate", "suggestions": ["suggestion1", "suggestion2"] },
    "authoritativeness": { "rating": "Weak", "suggestions": ["suggestion1", "suggestion2"] },
    "trustworthiness": { "rating": "Moderate", "suggestions": ["suggestion1", "suggestion2"] }
  },
  "smeInputMock": ["expert insight 1", "expert insight 2", "expert insight 3"]
}

Rules:
- Each "rating" must be exactly one of: "Weak", "Moderate", or "Strong"
- Each "suggestions" array must have 2-3 specific, actionable items based on the actual content
- "smeInputMock" must have 3-5 plausible Subject Matter Expert inputs (statistics, quotes, insights)
- Experience: personal insights, case studies, first-person examples
- Expertise: data, statistics, technical depth, citations
- Authoritativeness: credentials, expert quotes, reputable sources
- Trustworthiness: disclaimers, balanced perspectives, transparent language`;

export function buildEeatAuditUserPrompt(draftContent: string): string {
  return `Analyze this article for E-E-A-T quality. Respond with ONLY the JSON object — no other text.

Article:
---
${draftContent}
---`;
}

export const EEAT_REVISION_SYSTEM_PROMPT = `You are an expert content editor. Revise an article to address E-E-A-T audit gaps and incorporate SME inputs.

CRITICAL: You MUST respond using EXACTLY this format with delimiters. Do NOT use JSON. Do NOT wrap in code fences.

[REVISED_ARTICLE]
(Write the full revised article in markdown here)
[/REVISED_ARTICLE]

[CHANGES_SUMMARY]
(Write a brief summary of what was changed and why)
[/CHANGES_SUMMARY]

Rules:
- The revised article between [REVISED_ARTICLE] tags must be complete markdown
- Incorporate ALL audit suggestions to strengthen each E-E-A-T dimension
- Weave SME inputs naturally into the article
- Maintain original structure and key content
- The revised article must be more substantive than the original
- Start your response with [REVISED_ARTICLE] — no preamble`;

export function buildEeatRevisionUserPrompt(
  draftContent: string,
  audit: {
    experience: { rating: string; suggestions: string[] };
    expertise: { rating: string; suggestions: string[] };
    authoritativeness: { rating: string; suggestions: string[] };
    trustworthiness: { rating: string; suggestions: string[] };
  },
  smeInputs: string[]
): string {
  return `Revise this article using the delimiter format ([REVISED_ARTICLE]...[/REVISED_ARTICLE] and [CHANGES_SUMMARY]...[/CHANGES_SUMMARY]). Start immediately with [REVISED_ARTICLE].

Original article:
---
${draftContent}
---

E-E-A-T Audit Results:
- Experience (${audit.experience.rating}): ${audit.experience.suggestions.join('; ')}
- Expertise (${audit.expertise.rating}): ${audit.expertise.suggestions.join('; ')}
- Authoritativeness (${audit.authoritativeness.rating}): ${audit.authoritativeness.suggestions.join('; ')}
- Trustworthiness (${audit.trustworthiness.rating}): ${audit.trustworthiness.suggestions.join('; ')}

SME Inputs to incorporate:
${smeInputs.map(s => `- ${s}`).join('\n')}`;
}
