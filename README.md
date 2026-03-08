# Content Engine POC

AI-Powered Content Workflow — from keyword to publish-ready article in 6 automated stages.

---

## Overview

The Content Engine POC is a proof-of-concept web application that automates the full content creation lifecycle. Enter a keyword, and the system generates a publish-ready, humanized article through 6 sequential AI-powered stages. The tool handles keyword research, content planning, draft generation, quality auditing (Google's E-E-A-T framework), humanization, and final export — all in a single seamless workflow.

**Who is this for?** Content marketers, SEO professionals, and editorial teams who want to accelerate their content pipeline while maintaining quality and authenticity.

**Key Features:**
- 6-stage automated content pipeline
- Editable content brief (Stage 2) — add/remove keywords, outline sections, key points
- E-E-A-T quality audit with dimension-level scoring and AI-powered revision
- Humanization engine that removes AI writing patterns
- Auto-generated thumbnail/banner for each article
- Full review mode showing article, EEAT scores, banner, and metadata at once
- HTML export with meta description, word count, and read time
- Responsive design (desktop + mobile)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **AI Provider** | OpenRouter API (Google Gemini 2.5 Flash Lite) |
| **AI SDK** | OpenAI Node.js SDK (compatible with OpenRouter via custom baseURL) |
| **Markdown Rendering** | marked |
| **Session Management** | In-memory Map (UUID-based sessions) |
| **Deployment** | Vercel (serverless functions) |
| **Package Manager** | npm |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+
- An OpenRouter API key ([openrouter.ai/keys](https://openrouter.ai/keys))

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/content-engine-poc.git
cd content-engine-poc

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Create environment file from template
cp .env.example .env.local
```

Edit `.env.local` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=google/gemini-2.5-flash-lite
SESSION_TTL_MINUTES=60
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Build for Production (Optional)

```bash
# Type-check
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm start
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | Your OpenRouter API key |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | OpenRouter API endpoint |
| `AI_MODEL` | No | `google/gemini-2.5-flash-lite` | AI model identifier |
| `SESSION_TTL_MINUTES` | No | `60` | Session expiry in minutes |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Application URL |

---

## Workflow Explanation — The 6 Stages

### Stage 1: Topic & Keyword Research

**Input:** A seed keyword or topic (e.g., "remote work tools")
**What happens:** The AI analyzes the keyword and generates:
- **Related keywords** — Semantically connected search terms
- **Subtopics** — Logical sub-themes to cover in the article
- **Article angles** — Different perspectives and approaches for the content
- **Research summary** — Overview of the topic landscape

**Output:** Structured research data displayed as keyword badges, subtopic lists, and numbered article angles.

**API:** `POST /api/research` — Sends keyword, receives structured research JSON.

---

### Stage 2: Content Brief Generation (Editable)

**Input:** Research data from Stage 1
**What happens:** The AI creates a structured SEO content brief containing:
- **H1 title** recommendation
- **Secondary keywords** to target
- **Content outline** — H2 sections with H3 sub-sections
- **Search intent** classification (informational / commercial / transactional)
- **Target word count** range
- **Key points** to cover

**Editable:** Users can modify every field — add/remove keywords (tag-style), edit the outline structure, change word count targets, and update key points before proceeding.

**Output:** A comprehensive, editable content brief that guides the draft.

**API:** `POST /api/brief` (generate) | `PUT /api/brief/update` (save edits)

---

### Stage 3: AI First Draft

**Input:** Content brief from Stage 2
**What happens:** The AI generates a full-length article in markdown following the brief's outline, targeting the specified word count, incorporating the secondary keywords, and covering all key points.

**Output:** Rendered HTML article with word count badge.

**API:** `POST /api/draft` — Returns markdown content, rendered HTML, and word count.

---

### Stage 4: EEAT Audit & Enhancement

**Input:** First draft from Stage 3
**What happens:** This is a two-step process:

1. **EEAT Audit** — The AI evaluates the draft against Google's E-E-A-T framework:
   - **Experience** — Personal insights, case studies, first-hand observations
   - **Expertise** — Technical depth, data, statistics, citations
   - **Authoritativeness** — Expert credentials, reputable sources, quotes
   - **Trustworthiness** — Balanced perspectives, disclaimers, transparency

   Each dimension is rated as Weak / Moderate / Strong with specific improvement suggestions. The audit also generates mock Subject Matter Expert (SME) inputs.

2. **EEAT Revision** — The AI rewrites the draft incorporating all audit suggestions and SME inputs, strengthening every dimension.

**Output:** Audit report (4 dimensions with ratings and suggestions), SME inputs, revised draft, and a changes summary.

**API:** `POST /api/eeat` — Two sequential AI calls (audit JSON + revision with delimiters).

---

### Stage 5: Humanization

**Input:** EEAT-enhanced draft from Stage 4
**What happens:** The AI rewrites the article to sound naturally human by:
- Varying sentence length (mixing 5-10 word punchy sentences with 20-30 word explanations)
- Adding conversational elements (asides, rhetorical questions, first-person observations)
- Injecting light editorial opinions
- Reducing formality (contractions, active voice)
- Removing AI patterns ("Furthermore", "Additionally", "In conclusion", "It is worth noting")
- Adding natural parenthetical clarifications

**Output:** Humanized article with a collapsible list of humanization techniques applied.

**API:** `POST /api/humanize` — Returns humanized content + technique notes.

---

### Stage 6: Export / Publish Ready

**Input:** All pipeline data from Stages 1-5
**What happens:** The system generates:
- **Meta description** (AI-generated, targeting 140-160 characters)
- **Complete HTML document** with inline CSS, ready for publishing
- **Auto-generated thumbnail/banner** (1200x630 SVG with gradient, title, keyword)
- **Full review mode** — Displays everything at once: banner, EEAT scores, article, metadata

**Output:** Title, meta description with character count indicator, read time, word count, thumbnail preview, and action buttons (Review Article, Download HTML, Copy HTML).

**API:** `GET /api/export` (HTML document) | `GET /api/thumbnail` (SVG banner)

---

## Project Structure

```
content-engine-poc/
├── .env.example                    # Environment variables template
├── AI-USAGE-LOG.md                 # Detailed AI development log with timeline
├── README.md                       # This file
├── vercel.json                     # Vercel deployment config (60s timeout)
├── src/
│   ├── types/
│   │   └── pipeline.ts             # Core TypeScript interfaces
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts           # OpenRouter AI client + robust JSON parser
│   │   │   └── prompts/
│   │   │       ├── research.ts     # Stage 1 prompts
│   │   │       ├── brief.ts        # Stage 2 prompts
│   │   │       ├── draft.ts        # Stage 3 prompts
│   │   │       ├── eeat.ts         # Stage 4 prompts (JSON audit + delimiter revision)
│   │   │       └── humanize.ts     # Stage 5 prompts (delimiter format)
│   │   ├── session/
│   │   │   └── store.ts            # In-memory session store (Map-based)
│   │   └── utils/
│   │       ├── wordCount.ts        # Strip HTML/markdown, count words
│   │       ├── readTime.ts         # Read time estimator (200 wpm)
│   │       ├── validation.ts       # Keyword and meta description validators
│   │       └── markdown.ts         # Markdown-to-HTML renderer (marked)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Reusable button (primary/secondary/outline)
│   │   │   ├── Card.tsx            # Stage card wrapper with status
│   │   │   ├── Badge.tsx           # Keyword/status badge
│   │   │   ├── LoadingSpinner.tsx  # Loading indicator with message
│   │   │   └── ErrorMessage.tsx    # Error display with retry/reset
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Sticky app header
│   │   │   └── StageProgress.tsx   # 6-step visual progress indicator
│   │   └── stages/
│   │       ├── KeywordInput.tsx    # Stage 1: keyword input form
│   │       ├── ResearchOutput.tsx  # Stage 1: research results display
│   │       ├── BriefOutput.tsx     # Stage 2: brief display + full edit mode
│   │       ├── DraftOutput.tsx     # Stage 3: rendered article display
│   │       ├── EEATOutput.tsx      # Stage 4: audit report + revised draft
│   │       ├── HumanizedOutput.tsx # Stage 5: humanized draft + technique notes
│   │       ├── ExportOutput.tsx    # Stage 6: export actions + review trigger
│   │       ├── ThumbnailPreview.tsx# Thumbnail/banner image with download
│   │       └── ReviewMode.tsx      # Full-screen review overlay
│   └── app/
│       ├── layout.tsx              # Root layout (Inter font, metadata)
│       ├── page.tsx                # Main orchestrator (state, API calls, routing)
│       ├── globals.css             # Tailwind imports, CSS vars, animations
│       └── api/
│           ├── session/route.ts    # POST: create session
│           ├── research/route.ts   # POST: keyword research
│           ├── brief/route.ts      # POST: generate brief
│           ├── brief/update/route.ts # PUT: save brief edits
│           ├── draft/route.ts      # POST: generate draft
│           ├── eeat/route.ts       # POST: EEAT audit + revision
│           ├── humanize/route.ts   # POST: humanize draft
│           ├── export/route.ts     # GET: export HTML document
│           └── thumbnail/route.ts  # GET: generate SVG banner
```

## API Endpoints

| Method | Endpoint | Description | Input | Output |
|--------|----------|-------------|-------|--------|
| POST | `/api/session` | Create new pipeline session | — | `sessionId` |
| POST | `/api/research` | Stage 1: Keyword research | `sessionId`, `keyword` | Research data |
| POST | `/api/brief` | Stage 2: Content brief | `sessionId` | Brief data |
| PUT | `/api/brief/update` | Stage 2: Save brief edits | `sessionId`, `brief` | Updated brief |
| POST | `/api/draft` | Stage 3: AI first draft | `sessionId` | Article HTML + word count |
| POST | `/api/eeat` | Stage 4: EEAT audit & revision | `sessionId` | Audit + revised draft |
| POST | `/api/humanize` | Stage 5: Humanization | `sessionId` | Humanized draft + notes |
| GET | `/api/export` | Stage 6: Export package | `sessionId` (query) | Full HTML document |
| GET | `/api/thumbnail` | Generate banner image | `sessionId` (query) | SVG data URL |

---

## AI Tools Usage — Development Summary

This project was built almost entirely using AI-assisted development. See [`AI-USAGE-LOG.md`](./AI-USAGE-LOG.md) for the complete timeline with every prompt, timestamp, and duration.

### Development Timeline

| Phase | Date | Duration | What Happened |
|-------|------|----------|---------------|
| **BRD Creation** | 2026-03-05 15:24 | ~10 min | 10 comprehensive BRD documents generated using Claude AI |
| **Full App Build** | 2026-03-05 15:42 | ~23 min | Complete application built from BRD (30+ files, 9 API routes, 6 stage components) |
| **Feature Enhancement** | 2026-03-08 13:40 | ~32 min | 4 features: EEAT JSON fix, editable brief, thumbnail generation, review mode |
| **Bug Fix** | 2026-03-08 14:30 | ~15 min | Delimiter-based parsing for long content, maxTokens optimization |
| | | **~1h 20min total** | |

### How AI Was Used

1. **BRD Generation** — Claude AI generated the entire Business Requirements Document (10 files, ~120KB) defining the project's architecture, APIs, UI specs, and deployment strategy.

2. **Code Generation** — A single prompt ("Read the BRD files and start development") produced the entire working application — types, utilities, API routes, AI prompts, UI components, and the main orchestrator page.

3. **Prompt Engineering** — Claude designed all AI prompt templates for the 6 pipeline stages, including structured JSON output prompts and delimiter-based formats for long content.

4. **Debugging** — When the EEAT stage failed with JSON parsing errors, Claude identified the root cause (AI model returning prose around JSON, token truncation for long articles) and redesigned the output format from JSON to delimiter-based parsing.

5. **Feature Development** — Editable content brief, SVG thumbnail generation, and full review mode were all implemented by Claude in a single session.

### What Was Done Manually
- AI provider selection (OpenRouter + Gemini 2.5 Flash Lite)
- Environment variable configuration
- Bug reporting from real usage testing
- Feature ideation (editable brief, thumbnail, review mode)
- Git operations and deployment

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Add environment variables:
   - `OPENROUTER_API_KEY` = your key
   - `OPENROUTER_BASE_URL` = `https://openrouter.ai/api/v1`
   - `AI_MODEL` = `google/gemini-2.5-flash-lite`
   - `SESSION_TTL_MINUTES` = `60`
4. Click **Deploy**

Or via CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

> **Note:** Vercel free tier has a 10-second function timeout. AI calls may need the Pro plan ($20/mo) for the 60-second timeout configured in `vercel.json`. See the [BRD deployment guide](../BRD/06-deployment-vercel.md) for workarounds.

---

## Future Roadmap

This POC demonstrates the core content pipeline. Here's how it could evolve into a production system:

### 1. SERP API Integration
- **Google Search Console API** — Pull real search performance data for keyword research instead of AI-only analysis
- **SerpAPI / DataForSEO** — Real-time SERP analysis showing current top-ranking pages, featured snippets, People Also Ask questions
- **Keyword difficulty scores** — Integrate Ahrefs/SEMrush APIs for competition metrics
- **Content gap analysis** — Compare generated briefs against top 10 ranking pages

### 2. WordPress Publishing
- **Direct WordPress REST API integration** — One-click publish from Stage 6 to WordPress sites
- **Custom post type support** — Map content fields to WordPress custom fields and taxonomies
- **Featured image upload** — Auto-upload the generated thumbnail as the WordPress featured image
- **SEO plugin compatibility** — Auto-populate Yoast SEO / RankMath fields (meta title, description, focus keyword)
- **Draft/Schedule/Publish modes** — Choose to save as draft, schedule for a future date, or publish immediately

### 3. Analytics & Performance Tracking
- **Post-publish performance dashboard** — Track organic traffic, rankings, and engagement after publishing
- **Content scoring model** — ML-based quality scoring comparing against top-performing content
- **A/B testing for titles** — Generate multiple H1 variants and track CTR from search results
- **Readability metrics** — Flesch-Kincaid, Gunning Fog, and other readability scores in real time
- **Content decay alerts** — Notify when published articles start losing rankings

### 4. Content Calendar & Workflow
- **Editorial calendar view** — Visual calendar showing planned, in-progress, and published content
- **Multi-user collaboration** — Role-based access (writer, editor, SEO lead, approver) with approval workflows
- **Content clustering** — AI-driven topic clusters grouping related articles for internal linking strategy
- **Batch generation** — Queue multiple keywords and generate articles in parallel
- **Template library** — Save and reuse content briefs as templates for recurring content types

### 5. Additional Enhancements
- **Persistent storage** — Replace in-memory session store with Vercel KV (Redis) or PostgreSQL
- **User authentication** — Add login/signup with session persistence across devices
- **Multi-language support** — Generate content in different languages using the same pipeline
- **Plagiarism checking** — Integrate Copyscape or similar API to verify originality
- **Brand voice profiles** — Train custom tone/style preferences per brand or client
- **Export formats** — PDF, Google Docs, Notion, and Markdown export options beyond HTML
- **Version history** — Track and compare draft revisions across pipeline runs
- **API access** — RESTful API for programmatic content generation and integration with other tools

---

## License

This project is a proof of concept built for ERPRoots Assignment and demonstration purposes.
