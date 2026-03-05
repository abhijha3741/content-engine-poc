export interface EEATDimension {
  rating: 'Weak' | 'Moderate' | 'Strong';
  suggestions: string[];
}

export interface PipelineState {
  sessionId: string;
  createdAt: string;

  // Stage 1 — Research
  keyword: string;
  research?: {
    relatedKeywords: string[];
    subtopics: string[];
    articleAngles: string[];
    summary: string;
  };

  // Stage 2 — Brief
  brief?: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    h1: string;
    outline: { h2: string; h3s?: string[] }[];
    targetWordCount: { min: number; max: number };
    searchIntent: 'informational' | 'commercial' | 'transactional';
    keyPoints: string[];
  };

  // Stage 3 — First Draft
  firstDraft?: {
    content: string;
    contentHtml: string;
    wordCount: number;
  };

  // Stage 4 — EEAT
  eeat?: {
    audit: {
      experience: EEATDimension;
      expertise: EEATDimension;
      authoritativeness: EEATDimension;
      trustworthiness: EEATDimension;
    };
    smeInputMock: string[];
    revisedContent: string;
    revisedContentHtml: string;
    changesSummary: string;
  };

  // Stage 5 — Humanization
  humanized?: {
    content: string;
    contentHtml: string;
    techniqueNotes: string[];
    wordCount: number;
  };

  // Stage 6 — Export
  export?: {
    title: string;
    metaDescription: string;
    estimatedReadTime: number;
    bodyHtml: string;
    wordCount: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  sessionId?: string;
  stage?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
