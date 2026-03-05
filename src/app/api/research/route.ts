import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete, parseJsonResponse } from '@/lib/ai/client';
import { RESEARCH_SYSTEM_PROMPT, buildResearchUserPrompt } from '@/lib/ai/prompts/research';
import { validateKeyword } from '@/lib/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, keyword } = body;

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

    const validation = validateKeyword(keyword);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error!, retryable: false } },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();

    const raw = await aiComplete({
      systemPrompt: RESEARCH_SYSTEM_PROMPT,
      userPrompt: buildResearchUserPrompt(trimmedKeyword),
      maxTokens: 800,
    });

    const data = parseJsonResponse<{
      relatedKeywords: string[];
      subtopics: string[];
      articleAngles: string[];
      summary: string;
    }>(raw);

    updateSession(sessionId, {
      keyword: trimmedKeyword,
      research: data,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'research',
      data: { keyword: trimmedKeyword, ...data },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    const isAiError = message.includes('AI') || message.includes('API') || message.includes('parse');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isAiError ? 'AI_API_ERROR' : 'INTERNAL_ERROR',
          message: `Failed to generate research: ${message}`,
          retryable: true,
        },
      },
      { status: isAiError ? 502 : 500 }
    );
  }
}
