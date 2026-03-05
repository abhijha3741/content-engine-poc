import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete } from '@/lib/ai/client';
import { DRAFT_SYSTEM_PROMPT, buildDraftUserPrompt } from '@/lib/ai/prompts/draft';
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

    if (!session.brief) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 2 (Brief) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    const content = await aiComplete({
      systemPrompt: DRAFT_SYSTEM_PROMPT,
      userPrompt: buildDraftUserPrompt(session.brief),
      maxTokens: 3000,
      temperature: 0.7,
    });

    // Clean the response — remove any JSON wrapping if present
    let cleanContent = content.trim();
    // If it looks like it's wrapped in JSON, try to extract
    if (cleanContent.startsWith('{') || cleanContent.startsWith('"')) {
      try {
        const parsed = JSON.parse(cleanContent);
        cleanContent = typeof parsed === 'string' ? parsed : (parsed.content || parsed.article || parsed.draft || cleanContent);
      } catch {
        // Not JSON, use as-is
      }
    }

    const contentHtml = renderMarkdown(cleanContent);
    const wordCount = countWords(cleanContent);

    const draftData = { content: cleanContent, contentHtml, wordCount };
    updateSession(sessionId, { firstDraft: draftData });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'draft',
      data: { label: 'First AI Draft', ...draftData },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'AI_API_ERROR', message: `Failed to generate draft: ${message}`, retryable: true },
      },
      { status: 502 }
    );
  }
}
