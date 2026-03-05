import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { estimateReadTime } from '@/lib/utils/readTime';
import { aiComplete, parseJsonResponse } from '@/lib/ai/client';

const META_SYSTEM_PROMPT = `Generate a meta description for the given article. Return ONLY valid JSON:
{
  "metaDescription": "A compelling meta description between 140-160 characters that summarizes the article and includes the primary keyword"
}

The meta description MUST be between 140 and 160 characters. Count carefully.`;

function generateHtmlDocument(data: {
  title: string;
  metaDescription: string;
  bodyHtml: string;
  wordCount: number;
  estimatedReadTime: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${data.metaDescription.replace(/"/g, '&quot;')}">
  <meta property="og:title" content="${data.title.replace(/"/g, '&quot;')}">
  <meta property="og:description" content="${data.metaDescription.replace(/"/g, '&quot;')}">
  <title>${data.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: #111827;
      background: #fff;
      padding: 2rem 1rem;
    }
    article {
      max-width: 720px;
      margin: 0 auto;
    }
    .meta-bar {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
    h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
    h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; }
    ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 1rem;
      margin: 1.5rem 0;
      color: #4b5563;
      font-style: italic;
    }
    code {
      background: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    @media print {
      body { padding: 0; }
      .meta-bar { border-bottom: 1px solid #000; }
    }
  </style>
</head>
<body>
  <article>
    <h1>${data.title}</h1>
    <div class="meta-bar">
      ${data.wordCount.toLocaleString()} words &middot; ${data.estimatedReadTime} min read
    </div>
    ${data.bodyHtml}
  </article>
</body>
</html>`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sessionId is required.', retryable: false } },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session not found.', retryable: false } },
        { status: 404 }
      );
    }

    if (!session.humanized) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 5 (Humanize) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    // Generate meta description via AI
    const metaRaw = await aiComplete({
      systemPrompt: META_SYSTEM_PROMPT,
      userPrompt: `Article title: "${session.brief?.h1 || session.keyword}"\nPrimary keyword: "${session.keyword}"\n\nArticle content (first 500 chars):\n${session.humanized.content.slice(0, 500)}`,
      maxTokens: 200,
    });

    let metaDescription: string;
    try {
      const metaParsed = parseJsonResponse<{ metaDescription: string }>(metaRaw);
      metaDescription = metaParsed.metaDescription;
    } catch {
      metaDescription = `Discover everything about ${session.keyword}. This comprehensive guide covers strategies, best practices, and actionable tips to help you succeed in today's competitive landscape.`;
      // Trim to 160 chars if needed
      if (metaDescription.length > 160) {
        metaDescription = metaDescription.slice(0, 157) + '...';
      }
    }

    const title = session.brief?.h1 || session.keyword;
    const wordCount = session.humanized.wordCount;
    const readTime = estimateReadTime(wordCount);

    const exportData = {
      title,
      metaDescription,
      estimatedReadTime: readTime,
      bodyHtml: session.humanized.contentHtml,
      wordCount,
    };

    updateSession(sessionId, { export: exportData });

    const fullHtmlDocument = generateHtmlDocument(exportData);

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'export',
      data: {
        ...exportData,
        metaDescriptionLength: metaDescription.length,
        keywords: {
          primary: session.keyword,
          secondary: session.brief?.secondaryKeywords || [],
        },
        fullHtmlDocument,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: `Failed to generate export: ${message}`, retryable: true },
      },
      { status: 500 }
    );
  }
}
