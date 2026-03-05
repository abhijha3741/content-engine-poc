'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface HumanizedOutputProps {
  data: {
    contentHtml: string;
    wordCount: number;
    techniqueNotes: string[];
  };
  onNext: () => void;
  nextLoading?: boolean;
}

export function HumanizedOutput({ data, onNext, nextLoading }: HumanizedOutputProps) {
  const [showTechniques, setShowTechniques] = useState(false);

  return (
    <Card
      title="Humanization"
      stageNumber={5}
      status="completed"
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="success">Final Humanized Draft</Badge>
          <span className="text-xs text-gray-500">{data.wordCount.toLocaleString()} words</span>
        </div>
      }
      action={
        <Button onClick={onNext} loading={nextLoading} loadingText="Preparing Export...">
          Prepare Export
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
        </div>

        <div>
          <button
            onClick={() => setShowTechniques(!showTechniques)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
          >
            {showTechniques ? 'Hide' : 'Show'} Humanization Techniques Applied
          </button>
          {showTechniques && (
            <div className="mt-2 bg-indigo-50 rounded-lg p-3">
              <ul className="text-xs text-gray-600 space-y-1.5">
                {data.techniqueNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 flex-shrink-0">&bull;</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
