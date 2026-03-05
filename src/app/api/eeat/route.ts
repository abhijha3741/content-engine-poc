import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete, parseJsonResponse } from '@/lib/ai/client';
import {
  EEAT_AUDIT_SYSTEM_PROMPT,
  buildEeatAuditUserPrompt,
  EEAT_REVISION_SYSTEM_PROMPT,
  buildEeatRevisionUserPrompt,
} from '@/lib/ai/prompts/eeat';
import { renderMarkdown } from '@/lib/utils/markdown';
import type { EEATDimension } from '@/types/pipeline';

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

    if (!session.firstDraft) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 3 (Draft) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    // Step 1: EEAT Audit
    const auditRaw = await aiComplete({
      systemPrompt: EEAT_AUDIT_SYSTEM_PROMPT,
      userPrompt: buildEeatAuditUserPrompt(session.firstDraft.content),
      maxTokens: 1200,
    });

    const auditData = parseJsonResponse<{
      audit: {
        experience: { rating: string; suggestions: string[] };
        expertise: { rating: string; suggestions: string[] };
        authoritativeness: { rating: string; suggestions: string[] };
        trustworthiness: { rating: string; suggestions: string[] };
      };
      smeInputMock: string[];
    }>(auditRaw);

    // Step 2: EEAT Revision
    const revisionRaw = await aiComplete({
      systemPrompt: EEAT_REVISION_SYSTEM_PROMPT,
      userPrompt: buildEeatRevisionUserPrompt(
        session.firstDraft.content,
        auditData.audit,
        auditData.smeInputMock
      ),
      maxTokens: 4000,
      temperature: 0.7,
    });

    const revisionData = parseJsonResponse<{
      revisedContent: string;
      changesSummary: string;
    }>(revisionRaw);

    const revisedContentHtml = renderMarkdown(revisionData.revisedContent);

    const eeatResult = {
      audit: auditData.audit as {
        experience: EEATDimension;
        expertise: EEATDimension;
        authoritativeness: EEATDimension;
        trustworthiness: EEATDimension;
      },
      smeInputMock: auditData.smeInputMock,
      revisedContent: revisionData.revisedContent,
      revisedContentHtml,
      changesSummary: revisionData.changesSummary,
    };

    updateSession(sessionId, { eeat: eeatResult });

    return NextResponse.json({
      success: true,
      sessionId,
      stage: 'eeat',
      data: eeatResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'AI_API_ERROR', message: `Failed to run EEAT audit: ${message}`, retryable: true },
      },
      { status: 502 }
    );
  }
}
