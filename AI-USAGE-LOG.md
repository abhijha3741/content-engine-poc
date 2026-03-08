# AI Usage Log — Content Engine POC

> Full development timeline documenting every AI-assisted step from BRD creation to production-ready application.

---

## 1. AI Tools Used

| Tool | Version / Access Method | Primary Use |
|------|------------------------|-------------|
| Claude Code | CLI — Claude Opus 4.6 | BRD generation, full project scaffolding, API routes, UI components, prompt engineering, debugging, iterative feature development |
| OpenRouter API | google/gemini-2.5-flash-lite | Runtime AI model for all 6 content pipeline stages (research, brief, draft, EEAT audit, humanization, export) |

---

## 2. Complete Development Timeline

### Phase 0 — BRD Creation

| Timestamp | Duration | Activity |
|-----------|----------|----------|
| **2026-03-05 15:24** | ~10 min | Generated all 10 BRD documents using Claude AI |

**What happened:** Before any code was written, a comprehensive Business Requirements Document was generated using Claude AI. The BRD consists of 10 detailed documents covering every aspect of the project:

| File | Content | Created |
|------|---------|---------|
| `00-INDEX.md` | Document index and navigation | 15:24 |
| `01-project-overview.md` | Goals, scope, stakeholders, success criteria | 15:25 |
| `02-functional-requirements.md` | 6 workflow stages with acceptance criteria | 15:26 |
| `03-technical-architecture.md` | Tech stack, system design, data flow, folder structure | 15:27 |
| `04-api-design.md` | All API endpoints, request/response schemas, error codes | 15:28 |
| `05-ui-ux-requirements.md` | Wireframes, component specs, responsive behavior | 15:30 |
| `06-deployment-vercel.md` | Complete Vercel deployment guide | 15:31 |
| `07-testing-requirements.md` | Test plans and quality assurance | 15:32 |
| `08-ai-usage-log.md` | AI tooling documentation template | 15:33 |
| `09-future-roadmap.md` | Post-POC enhancement plans | 15:34 |

**AI Prompt Used for BRD:**
```
Create a complete Business Requirements Document for a Content Engine POC —
a Next.js web application that automates content creation through 6 AI-powered
stages: keyword research, content brief generation, AI draft writing, EEAT audit,
humanization, and export. Include technical architecture, API design, UI/UX specs,
deployment guide, and testing requirements.
```

---

### Phase 1 — Project Initialization & Full Build

| Timestamp | Duration | Activity |
|-----------|----------|----------|
| **2026-03-05 15:42** | — | Next.js project initialized (`create-next-app`) |
| **2026-03-05 15:42 – 16:05** | ~23 min | Complete application built from BRD |
| **2026-03-05 16:05** | — | First deployment commit |

**AI Prompt #1 — Full Project Generation:**
```
Read the complete BRD files and folders and start with the development
```

**What Claude Did (15:42 – 16:05):**
1. Read all 10 BRD documents sequentially to understand full project scope
2. Asked which AI provider to use (user chose OpenRouter + Gemini 2.5 Flash Lite)
3. Created Next.js 14 project with TypeScript, Tailwind CSS, App Router
4. Installed dependencies: `openai`, `uuid`, `marked` and their type definitions
5. Built the complete project in a single session:

| Component | Files Created | Time (est.) |
|-----------|--------------|-------------|
| TypeScript types | `src/types/pipeline.ts` | ~1 min |
| Utility functions | `wordCount.ts`, `readTime.ts`, `validation.ts`, `markdown.ts` | ~2 min |
| Session store | `src/lib/session/store.ts` (in-memory Map) | ~1 min |
| AI client | `src/lib/ai/client.ts` (OpenRouter via OpenAI SDK) | ~2 min |
| AI prompts | `research.ts`, `brief.ts`, `draft.ts`, `eeat.ts`, `humanize.ts` | ~3 min |
| API routes (7) | `session`, `research`, `brief`, `draft`, `eeat`, `humanize`, `export` | ~5 min |
| UI components (6) | `Button`, `Card`, `Badge`, `LoadingSpinner`, `ErrorMessage` | ~2 min |
| Layout components | `Header.tsx`, `StageProgress.tsx` | ~2 min |
| Stage components (6) | `KeywordInput`, `ResearchOutput`, `BriefOutput`, `DraftOutput`, `EEATOutput`, `HumanizedOutput`, `ExportOutput` | ~4 min |
| Main page | `src/app/page.tsx` — orchestrator connecting all stages | ~2 min |
| Config files | `.env.example`, `vercel.json`, `README.md`, `AI-USAGE-LOG.md` | ~1 min |

**AI Prompt #2 — Provider Selection:**
```
OpenRouter with 'Google: Gemini 2.5 Flash Lite' model
```

**Key Technical Decision:** The BRD specified OpenAI/Anthropic, but the user chose OpenRouter. Claude adapted by using the OpenAI SDK with `baseURL: 'https://openrouter.ai/api/v1'` for API compatibility.

**Build Verification:**
- TypeScript compilation: PASSED
- Next.js production build: PASSED
- Desktop preview: VERIFIED
- Mobile responsive preview: VERIFIED

---

### Phase 2 — Bug Fix & Feature Enhancement (Session 2)

| Timestamp | Duration | Activity |
|-----------|----------|----------|
| **2026-03-08 ~13:40** | — | User reported bugs and requested new features |
| **2026-03-08 13:40 – 14:12** | ~32 min | Implemented all 4 features |
| **2026-03-08 14:12** | — | Second commit: "EEAT error and thumbnail generation" |

**AI Prompt #3 — Bug Report + Feature Requests:**
```
on eeat step sometimes getting this error:-
"Failed to parse AI response as JSON" / "Unexpected token 'W', '[Well-Known'...
is not valid JSON"

Check it and also i want to give option to edit the stage 2 data: Content Brief
so user can add or remove anything they want. Also i want to generate a thumbnail
or banner for the content and in review mode show everything at once
```

**What Claude Did (13:40 – 14:12):**

#### Fix 1: EEAT JSON Parsing Errors (~8 min)

**Root cause identified:** The Gemini model was returning prose text around JSON objects, and sometimes the JSON was malformed.

**Files modified:**
- `src/lib/ai/client.ts` — Complete rewrite with:
  - `parseJsonResponse<T>()` — 6-step fallback JSON extraction (strip code fences -> direct parse -> clean artifacts -> brace-matched extraction -> raw extraction -> array extraction)
  - `aiCompleteJson<T>()` — Wrapper with automatic retry (up to 2 attempts, lower temperature + stricter re-prompt on retry)
  - `extractOutermostJson()` — Brace-depth counting that respects string literals
  - `cleanJsonString()` — Removes trailing commas and control characters

- `src/lib/ai/prompts/eeat.ts` — Added `CRITICAL:` prefix, explicit JSON format examples, `"Start with { end with }"` instructions to system prompts

- `src/app/api/eeat/route.ts` — Switched audit step to use `aiCompleteJson` with auto-retry

#### Feature 2: Editable Content Brief (~8 min)

**Files created/modified:**
- `src/app/api/brief/update/route.ts` — **NEW** PUT endpoint for saving brief edits
- `src/components/stages/BriefOutput.tsx` — Complete rewrite with view/edit toggle:
  - Inline editing of H1 title
  - Search intent dropdown selector
  - Add/remove secondary keywords (tag-style chips)
  - Add/remove/edit outline sections (H2 headings + H3 subheadings)
  - Editable target word count (min/max inputs)
  - Add/remove key points
  - Save/Cancel buttons with API persistence

#### Feature 3: Thumbnail/Banner Generation (~6 min)

**Files created:**
- `src/app/api/thumbnail/route.ts` — **NEW** GET endpoint:
  - Generates 1200x630 SVG banner programmatically
  - Uses keyword hash to deterministically pick gradient colors from 8 palettes
  - Adds decorative circles, title text, and keyword subtitle
  - Returns base64 data URL for immediate rendering
- `src/components/stages/ThumbnailPreview.tsx` — **NEW** component with image display + download button

#### Feature 4: Review Mode (~6 min)

**Files created/modified:**
- `src/components/stages/ReviewMode.tsx` — **NEW** full-screen modal overlay:
  - Sticky header with Download HTML / Copy HTML / Close buttons
  - Full-width banner image
  - Title, meta bar (word count, read time, keyword badges)
  - Meta description box
  - EEAT quality scores (4 colored dimension circles in a grid)
  - Full article body with prose styling
  - Humanization techniques section
- `src/components/stages/ExportOutput.tsx` — Integrated ReviewMode + ThumbnailPreview, replaced old basic preview
- `src/app/page.tsx` — Added `handleBriefUpdate`, thumbnail fetching after export, passing `eeatAudit`/`techniqueNotes`/`thumbnailDataUrl` props

**Build Verification:**
- TypeScript compilation: PASSED
- Next.js production build: PASSED (all 11 routes confirmed)
- Desktop + mobile preview: VERIFIED

---

### Phase 3 — EEAT Revision Truncation Fix (Session 3)

| Timestamp | Duration | Activity |
|-----------|----------|----------|
| **2026-03-08 ~14:30** | ~15 min | Fixed EEAT revision and humanize truncation |

**AI Prompt #4 — Second EEAT Error:**
```
Failed to run EEAT audit: Failed to parse AI JSON after 3 attempts.
Response preview: "```json { "revisedContent": "# Antigravity: The Ultimate Video
Coding Tool..."
```

**Root cause identified:** The EEAT revision step was wrapping a full-length article inside a JSON `revisedContent` string field. With `maxTokens: 4000`, the response was getting truncated before the JSON could close. AI models also struggle to properly JSON-escape long markdown content (newlines, quotes).

**Solution:** Switched from JSON output to delimiter-based format for all long-content stages.

**Files modified:**

| File | Change |
|------|--------|
| `src/lib/ai/prompts/eeat.ts` | Revision prompt now uses `[REVISED_ARTICLE]...[/REVISED_ARTICLE]` + `[CHANGES_SUMMARY]...[/CHANGES_SUMMARY]` delimiters |
| `src/app/api/eeat/route.ts` | Revision step uses `aiComplete` (plain text) with `maxTokens: 16000` + custom `parseDelimitedResponse()` with fallback |
| `src/lib/ai/prompts/humanize.ts` | Now uses `[HUMANIZED_ARTICLE]...[/HUMANIZED_ARTICLE]` + `[TECHNIQUE_NOTES]...[/TECHNIQUE_NOTES]` delimiters |
| `src/app/api/humanize/route.ts` | Uses `aiComplete` with `maxTokens: 16000` + custom `parseHumanizeResponse()` with fallback |
| `src/app/api/draft/route.ts` | Increased `maxTokens` from 3000 to 8000 |

**Key insight:** JSON wrapping is reliable for small structured data (EEAT audit scores). For long-form content (full articles), delimiter-based formats are far more robust — no escaping issues, no truncation problems.

---

## 3. Concrete AI Prompts Used — Summary Table

| # | Timestamp | Prompt | Duration | Outcome |
|---|-----------|--------|----------|---------|
| 0 | 2026-03-05 ~15:15 | "Create a complete BRD for a Content Engine POC..." | ~10 min | 10 BRD documents generated |
| 1 | 2026-03-05 15:42 | "Read the complete BRD files and folders and start with the development" | ~23 min | Complete app built (30+ files, 7 API routes, 6 stage components) |
| 2 | 2026-03-05 15:44 | "OpenRouter with 'Google: Gemini 2.5 Flash Lite' model" | ~1 min | AI provider configured |
| 3 | 2026-03-08 13:40 | "on eeat step sometimes getting this error... also i want to edit stage 2... thumbnail... review mode" | ~32 min | 4 features: JSON fix, editable brief, thumbnail, review mode |
| 4 | 2026-03-08 ~14:30 | "Failed to run EEAT audit: Failed to parse AI JSON after 3 attempts..." | ~15 min | Delimiter-based parsing for long content, maxTokens increased |

**Total AI-assisted development time: ~1 hour 20 minutes**

---

## 4. Architecture Decisions Made by AI

| Decision | Reasoning |
|----------|-----------|
| OpenAI SDK with custom baseURL for OpenRouter | API-compatible, no custom HTTP client needed |
| In-memory `Map` for session store | Sufficient for POC; BRD acknowledges Vercel KV for production |
| 6-step JSON fallback parser | Gemini model inconsistently wraps JSON in code fences, prose, or malformed structures |
| Delimiter format for long content | JSON truncation at token limits is unrecoverable; delimiters allow partial extraction |
| SVG-based thumbnail (not AI image generation) | OpenRouter/Gemini doesn't support image generation; SVG is deterministic, instant, and zero-cost |
| `maxTokens: 16000` for revision/humanize | Full articles need 3000-8000 tokens; buffer ensures no truncation |
| Auto-retry with lower temperature | Failed JSON parse often succeeds on retry with `temperature: 0.3` and stricter instructions |

---

## 5. Files Generated by AI

### Complete File Inventory (36 files)

```
content-engine-poc/
├── .env.example                              # Environment template
├── AI-USAGE-LOG.md                           # This file
├── README.md                                 # Project documentation
├── vercel.json                               # Vercel deployment config
├── src/
│   ├── types/
│   │   └── pipeline.ts                       # Core TypeScript interfaces
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts                     # OpenRouter AI client + JSON parser
│   │   │   └── prompts/
│   │   │       ├── research.ts               # Stage 1 prompts
│   │   │       ├── brief.ts                  # Stage 2 prompts
│   │   │       ├── draft.ts                  # Stage 3 prompts
│   │   │       ├── eeat.ts                   # Stage 4 prompts (JSON + delimiter)
│   │   │       └── humanize.ts               # Stage 5 prompts (delimiter)
│   │   ├── session/
│   │   │   └── store.ts                      # In-memory session store
│   │   └── utils/
│   │       ├── wordCount.ts                  # Word counting utility
│   │       ├── readTime.ts                   # Read time estimator
│   │       ├── validation.ts                 # Input validators
│   │       └── markdown.ts                   # Markdown renderer
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                    # Reusable button
│   │   │   ├── Card.tsx                      # Stage card wrapper
│   │   │   ├── Badge.tsx                     # Keyword/status badge
│   │   │   ├── LoadingSpinner.tsx            # Loading indicator
│   │   │   └── ErrorMessage.tsx              # Error display with retry
│   │   ├── layout/
│   │   │   ├── Header.tsx                    # App header
│   │   │   └── StageProgress.tsx             # 6-step progress bar
│   │   └── stages/
│   │       ├── KeywordInput.tsx              # Stage 1 input
│   │       ├── ResearchOutput.tsx            # Stage 1 results
│   │       ├── BriefOutput.tsx               # Stage 2 (with edit mode)
│   │       ├── DraftOutput.tsx               # Stage 3 display
│   │       ├── EEATOutput.tsx                # Stage 4 audit + revision
│   │       ├── HumanizedOutput.tsx           # Stage 5 display
│   │       ├── ExportOutput.tsx              # Stage 6 export
│   │       ├── ThumbnailPreview.tsx          # Banner image display
│   │       └── ReviewMode.tsx                # Full review overlay
│   └── app/
│       ├── layout.tsx                        # Root layout
│       ├── page.tsx                          # Main orchestrator
│       ├── globals.css                       # Global styles
│       └── api/
│           ├── session/route.ts              # POST: create session
│           ├── research/route.ts             # POST: keyword research
│           ├── brief/route.ts                # POST: generate brief
│           ├── brief/update/route.ts         # PUT: edit brief
│           ├── draft/route.ts                # POST: generate draft
│           ├── eeat/route.ts                 # POST: EEAT audit + revision
│           ├── humanize/route.ts             # POST: humanize draft
│           ├── export/route.ts               # GET: export HTML
│           └── thumbnail/route.ts            # GET: generate banner
```

---

## 6. Key Observations

### Where AI Accelerated Development
- **BRD-to-code translation** — Claude read structured requirements and generated matching implementation in ~23 minutes
- **TypeScript interfaces** — Generated typed interfaces matching the API contract from BRD specs
- **Prompt engineering** — Crafted system/user prompts for structured output from Gemini model
- **Debugging AI output** — Identified JSON truncation root cause and designed delimiter-based solution
- **Multi-feature implementation** — Built 4 features (JSON fix, editable brief, thumbnail, review mode) in a single ~32 min session

### Where Manual Work Was Essential
- **Provider selection** — User chose OpenRouter + Gemini instead of the BRD's OpenAI/Anthropic spec
- **Bug reporting** — User identified the EEAT JSON parsing failures from real usage
- **Feature ideation** — User requested the editable brief, thumbnail, and review mode features
- **Environment configuration** — Setting up `.env.local` with actual API keys
- **Deployment** — Vercel account setup and environment variable configuration

### Lessons Learned
1. **AI models struggle with JSON-wrapped long content** — Always use delimiters or plain text for outputs longer than ~500 words
2. **Token limits silently truncate** — Set `maxTokens` 2-3x higher than expected content length
3. **Retry with lower temperature works** — Failed JSON parse often succeeds on retry at `temperature: 0.3`
4. **BRD-driven development is effective** — A detailed BRD enabled AI to generate a complete, working application in under 25 minutes
