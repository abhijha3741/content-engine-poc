'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface EEATDimension {
  rating: string;
  suggestions: string[];
}

interface EEATOutputProps {
  data: {
    audit: {
      experience: EEATDimension;
      expertise: EEATDimension;
      authoritativeness: EEATDimension;
      trustworthiness: EEATDimension;
    };
    smeInputMock: string[];
    revisedContentHtml: string;
    changesSummary: string;
  };
  onNext: () => void;
  nextLoading?: boolean;
}

function RatingBadge({ rating }: { rating: string }) {
  const variant = rating === 'Strong' ? 'success' : rating === 'Moderate' ? 'info' : 'warning';
  return <Badge variant={variant}>{rating}</Badge>;
}

function DimensionRow({ name, dim }: { name: string; dim: EEATDimension }) {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800 text-sm">{name}</span>
        <RatingBadge rating={dim.rating} />
      </div>
      <ul className="list-disc list-inside text-xs text-gray-500 space-y-0.5 pl-1">
        {dim.suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export function EEATOutput({ data, onNext, nextLoading }: EEATOutputProps) {
  const [showChanges, setShowChanges] = useState(false);

  return (
    <Card
      title="EEAT Audit & Enhancement"
      stageNumber={4}
      status="completed"
      action={
        <Button onClick={onNext} loading={nextLoading} loadingText="Humanizing Draft...">
          Humanize Draft
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Audit Report */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">EEAT Audit Report</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <DimensionRow name="Experience" dim={data.audit.experience} />
            <DimensionRow name="Expertise" dim={data.audit.expertise} />
            <DimensionRow name="Authoritativeness" dim={data.audit.authoritativeness} />
            <DimensionRow name="Trustworthiness" dim={data.audit.trustworthiness} />
          </div>
        </div>

        {/* SME Input */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Subject Matter Expert Input (Simulated)</h4>
          <div className="bg-blue-50 rounded-lg p-3">
            <ul className="text-xs text-gray-600 space-y-2">
              {data.smeInputMock.map((input, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 flex-shrink-0">&bull;</span>
                  {input}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revised Draft */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Revised Draft</h4>
            <Badge variant="success">EEAT Enhanced Version</Badge>
          </div>
          <div className="max-h-[400px] overflow-y-auto prose prose-sm max-w-none border rounded-lg p-3">
            <div dangerouslySetInnerHTML={{ __html: data.revisedContentHtml }} />
          </div>
          <button
            onClick={() => setShowChanges(!showChanges)}
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 focus:outline-none"
          >
            {showChanges ? 'Hide' : 'Show'} change summary
          </button>
          {showChanges && (
            <p className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded">{data.changesSummary}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
