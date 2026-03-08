import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, brief } = body;

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
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Brief must be generated first.', retryable: false } },
        { status: 409 }
      );
    }

    if (!brief || !brief.h1 || !brief.outline) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid brief data.', retryable: false } },
        { status: 400 }
      );
    }

    updateSession(sessionId, { brief });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'brief',
      data: brief,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message, retryable: false } },
      { status: 500 }
    );
  }
}
