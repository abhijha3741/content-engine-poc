import { NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/session/store';

export async function POST() {
  try {
    const session = createSession();
    const ttl = parseInt(process.env.SESSION_TTL_MINUTES || '60', 10);
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        expiresAt,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create session.', retryable: false },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

  const completedStages: string[] = [];
  if (session.research) completedStages.push('research');
  if (session.brief) completedStages.push('brief');
  if (session.firstDraft) completedStages.push('draft');
  if (session.eeat) completedStages.push('eeat');
  if (session.humanized) completedStages.push('humanize');
  if (session.export) completedStages.push('export');

  return NextResponse.json({
    success: true,
    session: { ...session, completedStages },
  });
}
