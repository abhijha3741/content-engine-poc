'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ResearchOutputProps {
  data: {
    keyword: string;
    relatedKeywords: string[];
    subtopics: string[];
    articleAngles: string[];
    summary: string;
  };
  onNext: () => void;
  nextLoading?: boolean;
}

export function ResearchOutput({ data, onNext, nextLoading }: ResearchOutputProps) {
  return (
    <Card
      title="Topic & Keyword Research"
      stageNumber={1}
      status="completed"
      action={
        <Button onClick={onNext} loading={nextLoading} loadingText="Generating Brief...">
          Generate Content Brief
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {data.relatedKeywords.map((kw, i) => (
              <Badge key={i} variant="default">{kw}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Subtopics</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {data.subtopics.map((st, i) => (
              <li key={i}>{st}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Article Angles</h4>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            {data.articleAngles.map((angle, i) => (
              <li key={i}>{angle}</li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
          <p className="text-sm text-gray-600">{data.summary}</p>
        </div>
      </div>
    </Card>
  );
}
