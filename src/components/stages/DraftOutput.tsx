'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DraftOutputProps {
  data: {
    contentHtml: string;
    wordCount: number;
  };
  onNext: () => void;
  nextLoading?: boolean;
}

export function DraftOutput({ data, onNext, nextLoading }: DraftOutputProps) {
  return (
    <Card
      title="AI First Draft"
      stageNumber={3}
      status="completed"
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="default">First AI Draft</Badge>
          <span className="text-xs text-gray-500">{data.wordCount.toLocaleString()} words</span>
        </div>
      }
      action={
        <Button onClick={onNext} loading={nextLoading} loadingText="Running EEAT Audit...">
          Run EEAT Audit
        </Button>
      }
    >
      <div className="max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      </div>
    </Card>
  );
}
