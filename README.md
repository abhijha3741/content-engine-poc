# Content Engine POC

AI-Powered Content Workflow — from keyword to publish-ready article in 6 automated stages.

## Overview

The Content Engine POC is a proof-of-concept web application that automates the full content creation lifecycle. Enter a keyword, and the system generates a publish-ready, humanized article through 6 sequential AI-powered stages:

1. **Topic & Keyword Research** — Generates related keywords, subtopics, article angles
2. **Content Brief Generation** — Creates a structured SEO brief with outline and key points
3. **AI First Draft** — Produces a full-length article following the brief
4. **EEAT Audit & Enhancement** — Audits for Experience, Expertise, Authoritativeness, Trustworthiness and enhances the draft
5. **Humanization** — Rewrites to sound naturally human, removing AI patterns
6. **Export / Publish Ready** — Preview, download HTML, or copy to clipboard

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Provider:** OpenRouter (Google Gemini 2.5 Flash Lite)
- **Deployment:** Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd content-engine-poc

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key |
| `OPENROUTER_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |
| `AI_MODEL` | No | Defaults to `google/gemini-2.5-flash-lite` |
| `SESSION_TTL_MINUTES` | No | Session expiry in minutes (default: 60) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes for each pipeline stage
│   │   ├── session/   # Session management
│   │   ├── research/  # Stage 1
│   │   ├── brief/     # Stage 2
│   │   ├── draft/     # Stage 3
│   │   ├── eeat/      # Stage 4
│   │   ├── humanize/  # Stage 5
│   │   └── export/    # Stage 6
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Main application page
│   └── globals.css    # Global styles
├── components/
│   ├── layout/        # Header, StageProgress
│   ├── stages/        # Stage-specific output components
│   └── ui/            # Reusable UI components
├── lib/
│   ├── ai/            # AI client and prompt templates
│   ├── session/       # In-memory session store
│   └── utils/         # Utility functions
└── types/             # TypeScript interfaces
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Create new pipeline session |
| POST | `/api/research` | Stage 1 — Keyword research |
| POST | `/api/brief` | Stage 2 — Content brief |
| POST | `/api/draft` | Stage 3 — AI first draft |
| POST | `/api/eeat` | Stage 4 — EEAT audit & revision |
| POST | `/api/humanize` | Stage 5 — Humanization |
| GET | `/api/export` | Stage 6 — Export data |

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

Set environment variables in Vercel dashboard under Settings > Environment Variables.
