# AI Usage Log

## 1. AI Tools Used

| Tool | Version / Access Method | Primary Use |
|------|------------------------|-------------|
| Claude Code | CLI — Claude Opus 4.6 | Full project scaffolding, API routes, UI components, prompt engineering |

## 2. Development Phases and AI Delegation

| Phase | Task | Delegated to AI? | Manual Work |
|-------|------|-----------------|-------------|
| Project setup | Create Next.js project structure with all directories | Yes | Configured env variables and OpenRouter integration |
| Types | Define PipelineState TypeScript interfaces | Yes | Reviewed and validated against BRD spec |
| AI Client | Build OpenRouter-compatible AI client with JSON parsing | Yes | Configured base URL and model selection |
| Prompt engineering | Write system/user prompts for all 6 stages | Yes | Tested and refined prompt quality |
| API routes | Implement all 7 API route handlers | Yes | Reviewed error handling and stage gating logic |
| UI components | Stage cards, progress indicator, keyword input, export | Yes | Reviewed responsive behavior |
| Main page | Orchestrator page connecting all stages | Yes | Tested end-to-end flow |
| Error handling | Retry logic, error states, loading indicators | Yes | Verified UX patterns |

## 3. Concrete AI Prompts Used

### Prompt 1 — Full Project Generation from BRD

**Tool:** Claude Code (Opus 4.6)
**Phase:** Initial setup

**Prompt:**
```
Read the complete BRD files and folders and start with the development
```

**AI Output Summary:**
Claude Code read all 10 BRD documents (project overview, functional requirements, technical architecture, API design, UI/UX requirements, deployment guide, testing requirements, AI usage log template, and future roadmap), then generated the complete project including all TypeScript types, API routes, UI components, AI prompt templates, and the main orchestrator page.

**What was changed manually:**
- OpenRouter configuration (user specified OpenRouter + Gemini 2.5 Flash Lite instead of OpenAI/Anthropic from the BRD)

### Prompt 2 — AI Prompt Engineering for EEAT Audit

**Tool:** Claude Code
**Phase:** Stage 4 implementation

**Prompt:**
The EEAT audit prompt was generated as part of the full project build, designed to:
1. Rate each of the 4 EEAT dimensions as Weak/Moderate/Strong
2. Provide 2-3 specific improvement suggestions per dimension
3. Generate mock SME inputs
4. Return structured JSON output

**AI Output Summary:**
Generated a comprehensive system prompt with clear rating criteria, JSON output schema, and separate prompts for the audit report and the revision step.

### Prompt 3 — Humanization Prompt Design

**Tool:** Claude Code
**Phase:** Stage 5 implementation

**Prompt:**
Designed within the full build to handle:
1. Sentence length variation
2. Conversational inserts and rhetorical questions
3. Opinion injections
4. AI pattern removal (overused transitions)
5. Technique documentation

**AI Output Summary:**
Generated a humanization system prompt that instructs the AI to apply specific transformations and return both the rewritten article and a list of techniques applied.

## 4. Key Observations

### Where AI Accelerated Development
- **Full project scaffolding from BRD specs** — Reading and implementing from structured requirements documents
- **TypeScript interfaces** — Generating typed interfaces matching the API contract
- **Prompt engineering** — Crafting system/user prompts for structured JSON output
- **UI component generation** — Tailwind-styled responsive components

### Where Manual Work Was Essential
- **Provider configuration** — Adapting from OpenAI to OpenRouter required understanding the API compatibility layer
- **BRD interpretation** — Understanding which requirements are mandatory vs nice-to-have for POC
