import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete, parseJsonResponse } from '@/lib/ai/client';
import { BRIEF_SYSTEM_PROMPT, buildBriefUserPrompt } from '@/lib/ai/prompts/brief';

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

    if (!session.research) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 1 (Research) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    const raw = await aiComplete({
      systemPrompt: BRIEF_SYSTEM_PROMPT,
      userPrompt: buildBriefUserPrompt(session.keyword, session.research),
      maxTokens: 1000,
    });

    const data = parseJsonResponse<{
      primaryKeyword: string;
      secondaryKeywords: string[];
      h1: string;
      outline: { h2: string; h3s?: string[] }[];
      targetWordCount: { min: number; max: number };
      searchIntent: 'informational' | 'commercial' | 'transactional';
      keyPoints: string[];
    }>(raw);

    updateSession(sessionId, { brief: data });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'brief',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'AI_API_ERROR', message: `Failed to generate brief: ${message}`, retryable: true },
      },
      { status: 502 }
    );
  }
}
