import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete, parseJsonResponse } from '@/lib/ai/client';
import { HUMANIZE_SYSTEM_PROMPT, buildHumanizeUserPrompt } from '@/lib/ai/prompts/humanize';
import { renderMarkdown } from '@/lib/utils/markdown';
import { countWords } from '@/lib/utils/wordCount';

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
      maxTokens: 4000,
      temperature: 0.8,
    });

    const data = parseJsonResponse<{
      content: string;
      techniqueNotes: string[];
    }>(raw);

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
