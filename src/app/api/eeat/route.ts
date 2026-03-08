import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session/store';
import { aiComplete, aiCompleteJson } from '@/lib/ai/client';
import {
  EEAT_AUDIT_SYSTEM_PROMPT,
  buildEeatAuditUserPrompt,
  EEAT_REVISION_SYSTEM_PROMPT,
  buildEeatRevisionUserPrompt,
} from '@/lib/ai/prompts/eeat';
import { renderMarkdown } from '@/lib/utils/markdown';
import type { EEATDimension } from '@/types/pipeline';

function parseDelimitedResponse(raw: string): { revisedContent: string; changesSummary: string } {
  // Extract content between [REVISED_ARTICLE] and [/REVISED_ARTICLE]
  const articleMatch = raw.match(/\[REVISED_ARTICLE\]\s*([\s\S]*?)\s*\[\/REVISED_ARTICLE\]/);
  const summaryMatch = raw.match(/\[CHANGES_SUMMARY\]\s*([\s\S]*?)\s*\[\/CHANGES_SUMMARY\]/);

  let revisedContent = articleMatch?.[1]?.trim() || '';
  let changesSummary = summaryMatch?.[1]?.trim() || '';

  // Fallback: if no delimiters found, maybe the whole thing is the article
  if (!revisedContent) {
    // Try stripping any preamble before content starts
    const stripped = raw.replace(/^[\s\S]*?(?=# )/m, '').trim();
    if (stripped.length > 100) {
      revisedContent = stripped;
      changesSummary = changesSummary || 'Article was revised to improve E-E-A-T quality dimensions.';
    } else {
      throw new Error('Could not extract revised article from AI response. The model may have returned an unexpected format.');
    }
  }

  if (!changesSummary) {
    changesSummary = 'Article was revised to improve E-E-A-T quality dimensions.';
  }

  return { revisedContent, changesSummary };
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

    if (!session.firstDraft) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 3 (Draft) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    // Step 1: EEAT Audit (with auto-retry on JSON parse failure)
    const auditData = await aiCompleteJson<{
      audit: {
        experience: { rating: string; suggestions: string[] };
        expertise: { rating: string; suggestions: string[] };
        authoritativeness: { rating: string; suggestions: string[] };
        trustworthiness: { rating: string; suggestions: string[] };
      };
      smeInputMock: string[];
    }>({
      systemPrompt: EEAT_AUDIT_SYSTEM_PROMPT,
      userPrompt: buildEeatAuditUserPrompt(session.firstDraft.content),
      maxTokens: 1200,
    });

    // Step 2: EEAT Revision (plain text with delimiters — more reliable for long content)
    const revisionRaw = await aiComplete({
      systemPrompt: EEAT_REVISION_SYSTEM_PROMPT,
      userPrompt: buildEeatRevisionUserPrompt(
        session.firstDraft.content,
        auditData.audit,
        auditData.smeInputMock
      ),
      maxTokens: 16000,
      temperature: 0.7,
    });

    const revisionData = parseDelimitedResponse(revisionRaw);
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
