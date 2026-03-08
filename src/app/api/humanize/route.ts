import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete } from '@/lib/ai/client';
import { HUMANIZE_SYSTEM_PROMPT, buildHumanizeUserPrompt } from '@/lib/ai/prompts/humanize';
import { renderMarkdown } from '@/lib/utils/markdown';
import { countWords } from '@/lib/utils/wordCount';

function parseHumanizeResponse(raw: string): { content: string; techniqueNotes: string[] } {
  // Extract content between [HUMANIZED_ARTICLE] and [/HUMANIZED_ARTICLE]
  const articleMatch = raw.match(/\[HUMANIZED_ARTICLE\]\s*([\s\S]*?)\s*\[\/HUMANIZED_ARTICLE\]/);
  const notesMatch = raw.match(/\[TECHNIQUE_NOTES\]\s*([\s\S]*?)\s*\[\/TECHNIQUE_NOTES\]/);

  let content = articleMatch?.[1]?.trim() || '';
  let techniqueNotes: string[] = [];

  if (notesMatch?.[1]) {
    techniqueNotes = notesMatch[1]
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Fallback: if no delimiters found, treat entire response as the article
  if (!content) {
    const stripped = raw.replace(/^[\s\S]*?(?=# )/m, '').trim();
    if (stripped.length > 100) {
      content = stripped;
    } else {
      throw new Error('Could not extract humanized article from AI response.');
    }
  }

  if (techniqueNotes.length === 0) {
    techniqueNotes = ['Applied sentence length variation', 'Reduced formality and added contractions', 'Removed common AI transition patterns'];
  }

  return { content, techniqueNotes };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

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

    if (!session.eeat) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 4 (EEAT) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    const raw = await aiComplete({
      systemPrompt: HUMANIZE_SYSTEM_PROMPT,
      userPrompt: buildHumanizeUserPrompt(session.eeat.revisedContent),
      maxTokens: 16000,
      temperature: 0.8,
    });

    const data = parseHumanizeResponse(raw);

    const contentHtml = renderMarkdown(data.content);
    const wordCount = countWords(data.content);

    const humanizedResult = {
      content: data.content,
      contentHtml,
      techniqueNotes: data.techniqueNotes,
      wordCount,
    };

    updateSession(sessionId, { humanized: humanizedResult });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'humanize',
      data: { label: 'Final Humanized Draft', ...humanizedResult },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'AI_API_ERROR', message: `Failed to humanize draft: ${message}`, retryable: true },
      },
      { status: 502 }
    );
  }
}
