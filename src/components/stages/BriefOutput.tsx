'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BriefOutputProps {
  data: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    h1: string;
    outline: { h2: string; h3s?: string[] }[];
    targetWordCount: { min: number; max: number };
    searchIntent: 'informational' | 'commercial' | 'transactional';
    keyPoints: string[];
  };
  onNext: () => void;
  nextLoading?: boolean;
}

export function BriefOutput({ data, onNext, nextLoading }: BriefOutputProps) {
  return (
    <Card
      title="Content Brief"
      stageNumber={2}
      status="completed"
      action={
        <Button onClick={onNext} loading={nextLoading} loadingText="Generating Draft...">
          Generate First Draft
        </Button>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-700">Primary Keyword:</span>
            <p className="text-gray-600">{data.primaryKeyword}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Search Intent:</span>
            <div className="mt-1">
              <Badge variant={data.searchIntent}>{data.searchIntent}</Badge>
            </div>
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Secondary Keywords:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.secondaryKeywords.map((kw, i) => (
              <Badge key={i} variant="info">{kw}</Badge>
            ))}
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Recommended H1:</span>
          <p className="text-gray-800 font-medium mt-1">{data.h1}</p>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Article Outline:</span>
          <div className="mt-2 space-y-2">
            {data.outline.map((section, i) => (
              <div key={i} className="pl-3 border-l-2 border-indigo-200">
                <p className="font-medium text-gray-800">H2: {section.h2}</p>
                {section.h3s?.map((h3, j) => (
                  <p key={j} className="pl-4 text-gray-500">H3: {h3}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-700">Target Word Count:</span>
            <p className="text-gray-600">{data.targetWordCount.min.toLocaleString()} &ndash; {data.targetWordCount.max.toLocaleString()} words</p>
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Key Points to Cover:</span>
          <ul className="mt-1 space-y-1">
            {data.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600">
                <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
