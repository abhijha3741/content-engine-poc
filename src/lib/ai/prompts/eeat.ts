export const EEAT_AUDIT_SYSTEM_PROMPT = `You are an expert SEO content auditor specializing in Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) framework.

Analyze the provided article draft and produce an E-E-A-T audit report.

You MUST return ONLY valid JSON with no additional text, matching this exact structure:
{
  "audit": {
    "experience": { "rating": "Weak|Moderate|Strong", "suggestions": ["suggestion1", "suggestion2"] },
    "expertise": { "rating": "Weak|Moderate|Strong", "suggestions": ["suggestion1", "suggestion2"] },
    "authoritativeness": { "rating": "Weak|Moderate|Strong", "suggestions": ["suggestion1", "suggestion2"] },
    "trustworthiness": { "rating": "Weak|Moderate|Strong", "suggestions": ["suggestion1", "suggestion2"] }
  },
  "smeInputMock": ["expert insight 1", "expert insight 2", "expert insight 3"]
}

Rating criteria:
- Experience: Look for personal insights, case studies, first-person examples
- Expertise: Look for data, statistics, technical depth, citations
- Authoritativeness: Look for credentials, expert quotes, reputable sources
- Trustworthiness: Look for disclaimers, balanced perspectives, transparent language

Each dimension must have:
- A rating: exactly one of "Weak", "Moderate", or "Strong"
- 2-3 specific, actionable improvement suggestions based on the actual content

smeInputMock: Generate 3-5 plausible Subject Matter Expert inputs (statistics, quotes, insights) that would enhance the article.`;

export function buildEeatAuditUserPrompt(draftContent: string): string {
  return `Analyze the following article draft for E-E-A-T quality:

---
${draftContent}
---

Return your audit as ONLY valid JSON.`;
}

export const EEAT_REVISION_SYSTEM_PROMPT = `You are an expert content editor. Take the original article draft, the E-E-A-T audit suggestions, and SME inputs, and produce an enhanced version that addresses all gaps.

Requirements:
- Incorporate the audit suggestions to strengthen each E-E-A-T dimension
- Weave in the SME inputs naturally throughout the article
- Maintain the original structure and key content
- The revised article should be substantively improved and slightly longer than the original
- Write in markdown format

Return a JSON object with this exact structure:
{
  "revisedContent": "The full revised article in markdown...",
  "changesSummary": "Brief summary of what was changed and why"
}`;

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
  return `Original article:
---
${draftContent}
---

E-E-A-T Audit Results:
- Experience (${audit.experience.rating}): ${audit.experience.suggestions.join('; ')}
- Expertise (${audit.expertise.rating}): ${audit.expertise.suggestions.join('; ')}
- Authoritativeness (${audit.authoritativeness.rating}): ${audit.authoritativeness.suggestions.join('; ')}
- Trustworthiness (${audit.trustworthiness.rating}): ${audit.trustworthiness.suggestions.join('; ')}

Subject Matter Expert Inputs to incorporate:
${smeInputs.map(s => `- ${s}`).join('\n')}

Produce the enhanced revised article. Return ONLY valid JSON.`;
}
