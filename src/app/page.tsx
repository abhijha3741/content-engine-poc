'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StageProgress } from '@/components/layout/StageProgress';
import { KeywordInput } from '@/components/stages/KeywordInput';
import { ResearchOutput } from '@/components/stages/ResearchOutput';
import { BriefOutput } from '@/components/stages/BriefOutput';
import { DraftOutput } from '@/components/stages/DraftOutput';
import { EEATOutput } from '@/components/stages/EEATOutput';
import { HumanizedOutput } from '@/components/stages/HumanizedOutput';
import { ExportOutput } from '@/components/stages/ExportOutput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type StageData = {
  research?: {
    keyword: string;
    relatedKeywords: string[];
    subtopics: string[];
    articleAngles: string[];
    summary: string;
  };
  brief?: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    h1: string;
    outline: { h2: string; h3s?: string[] }[];
    targetWordCount: { min: number; max: number };
    searchIntent: 'informational' | 'commercial' | 'transactional';
    keyPoints: string[];
  };
  draft?: {
    contentHtml: string;
    wordCount: number;
  };
  eeat?: {
    audit: {
      experience: { rating: string; suggestions: string[] };
      expertise: { rating: string; suggestions: string[] };
      authoritativeness: { rating: string; suggestions: string[] };
      trustworthiness: { rating: string; suggestions: string[] };
    };
    smeInputMock: string[];
    revisedContentHtml: string;
    changesSummary: string;
  };
  humanized?: {
    contentHtml: string;
    wordCount: number;
    techniqueNotes: string[];
  };
  export?: {
    title: string;
    metaDescription: string;
    metaDescriptionLength: number;
    estimatedReadTime: number;
    bodyHtml: string;
    wordCount: number;
    keywords: { primary: string; secondary: string[] };
    fullHtmlDocument: string;
  };
};

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<{ stage: string; message: string } | null>(null);
  const [data, setData] = useState<StageData>({});
  const [inputKeyword, setInputKeyword] = useState('');

  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToStage = (stage: string) => {
    setTimeout(() => {
      stageRefs.current[stage]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Create session on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/session', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          setSessionId(json.sessionId);
        }
      } catch {
        setError({ stage: 'session', message: 'Failed to initialize session. Please refresh the page.' });
      }
    }
    init();
  }, []);

  const callStage = async (
    stage: string,
    url: string,
    method: 'POST' | 'GET' = 'POST',
    body?: Record<string, unknown>
  ) => {
    if (!sessionId) return;

    setLoading(stage);
    setError(null);

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method === 'POST') {
        options.body = JSON.stringify({ sessionId, ...body });
      }

      const finalUrl = method === 'GET' ? `${url}?sessionId=${sessionId}` : url;
      const res = await fetch(finalUrl, options);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || 'Unknown error');
      }

      return json.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError({ stage, message });
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleResearch = async (keyword: string) => {
    setInputKeyword(keyword);
    const result = await callStage('research', '/api/research', 'POST', { keyword });
    if (result) {
      setData((prev) => ({ ...prev, research: result }));
      setCurrentStage(2);
      scrollToStage('research');
    }
  };

  const handleBrief = async () => {
    const result = await callStage('brief', '/api/brief');
    if (result) {
      setData((prev) => ({ ...prev, brief: result }));
      setCurrentStage(3);
      scrollToStage('brief');
    }
  };

  const handleDraft = async () => {
    const result = await callStage('draft', '/api/draft');
    if (result) {
      setData((prev) => ({ ...prev, draft: result }));
      setCurrentStage(4);
      scrollToStage('draft');
    }
  };

  const handleEeat = async () => {
    const result = await callStage('eeat', '/api/eeat');
    if (result) {
      setData((prev) => ({ ...prev, eeat: result }));
      setCurrentStage(5);
      scrollToStage('eeat');
    }
  };

  const handleHumanize = async () => {
    const result = await callStage('humanize', '/api/humanize');
    if (result) {
      setData((prev) => ({ ...prev, humanized: result }));
      setCurrentStage(6);
      scrollToStage('humanized');
    }
  };

  const handleExport = async () => {
    const result = await callStage('export', '/api/export', 'GET');
    if (result) {
      setData((prev) => ({ ...prev, export: result }));
      setCurrentStage(7);
      scrollToStage('export');
    }
  };

  const handleReset = () => {
    setData({});
    setCurrentStage(0);
    setError(null);
    setLoading(null);
    setInputKeyword('');
    fetch('/api/session', { method: 'POST' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSessionId(json.sessionId);
      });
  };

  const retryMap: Record<string, () => void> = {
    research: () => handleResearch(inputKeyword),
    brief: handleBrief,
    draft: handleDraft,
    eeat: handleEeat,
    humanize: handleHumanize,
    export: handleExport,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <StageProgress currentStage={currentStage} error={!!error} />

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Keyword Input — always visible */}
        <KeywordInput
          onSubmit={handleResearch}
          loading={loading === 'research'}
          disabled={currentStage > 0}
        />

        {/* Stage 1: Research */}
        {loading === 'research' && !data.research && (
          <LoadingSpinner message="Researching your topic... This may take up to 30 seconds." />
        )}
        {error?.stage === 'research' && (
          <ErrorMessage message={error.message} onRetry={retryMap.research} onReset={handleReset} />
        )}
        {data.research && (
          <div ref={(el) => { stageRefs.current['research'] = el; }}>
            <ResearchOutput data={data.research} onNext={handleBrief} nextLoading={loading === 'brief'} />
          </div>
        )}

        {/* Stage 2: Brief */}
        {loading === 'brief' && !data.brief && (
          <LoadingSpinner message="Generating content brief..." />
        )}
        {error?.stage === 'brief' && (
          <ErrorMessage message={error.message} onRetry={retryMap.brief} onReset={handleReset} />
        )}
        {data.brief && (
          <div ref={(el) => { stageRefs.current['brief'] = el; }}>
            <BriefOutput data={data.brief} onNext={handleDraft} nextLoading={loading === 'draft'} />
          </div>
        )}

        {/* Stage 3: Draft */}
        {loading === 'draft' && !data.draft && (
          <LoadingSpinner message="Generating your first draft... This may take up to 60 seconds." />
        )}
        {error?.stage === 'draft' && (
          <ErrorMessage message={error.message} onRetry={retryMap.draft} onReset={handleReset} />
        )}
        {data.draft && (
          <div ref={(el) => { stageRefs.current['draft'] = el; }}>
            <DraftOutput data={data.draft} onNext={handleEeat} nextLoading={loading === 'eeat'} />
          </div>
        )}

        {/* Stage 4: EEAT */}
        {loading === 'eeat' && !data.eeat && (
          <LoadingSpinner message="Running EEAT audit and generating enhanced draft..." />
        )}
        {error?.stage === 'eeat' && (
          <ErrorMessage message={error.message} onRetry={retryMap.eeat} onReset={handleReset} />
        )}
        {data.eeat && (
          <div ref={(el) => { stageRefs.current['eeat'] = el; }}>
            <EEATOutput data={data.eeat} onNext={handleHumanize} nextLoading={loading === 'humanize'} />
          </div>
        )}

        {/* Stage 5: Humanize */}
        {loading === 'humanize' && !data.humanized && (
          <LoadingSpinner message="Humanizing the draft..." />
        )}
        {error?.stage === 'humanize' && (
          <ErrorMessage message={error.message} onRetry={retryMap.humanize} onReset={handleReset} />
        )}
        {data.humanized && (
          <div ref={(el) => { stageRefs.current['humanized'] = el; }}>
            <HumanizedOutput data={data.humanized} onNext={handleExport} nextLoading={loading === 'export'} />
          </div>
        )}

        {/* Stage 6: Export */}
        {loading === 'export' && !data.export && (
          <LoadingSpinner message="Preparing export..." />
        )}
        {error?.stage === 'export' && (
          <ErrorMessage message={error.message} onRetry={retryMap.export} onReset={handleReset} />
        )}
        {data.export && (
          <div ref={(el) => { stageRefs.current['export'] = el; }}>
            <ExportOutput data={data.export} />
          </div>
        )}

        {/* Session error */}
        {error?.stage === 'session' && (
          <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
        )}

        {/* Reset button when complete */}
        {currentStage >= 7 && (
          <div className="text-center py-4">
            <button
              onClick={handleReset}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-4 py-2"
            >
              Start a new article
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
