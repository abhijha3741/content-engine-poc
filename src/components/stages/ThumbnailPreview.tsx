'use client';

import { Button } from '@/components/ui/Button';

interface ThumbnailPreviewProps {
  thumbnailDataUrl: string;
  title: string;
}

export function ThumbnailPreview({ thumbnailDataUrl, title }: ThumbnailPreviewProps) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = thumbnailDataUrl;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-banner.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailDataUrl}
          alt={`Banner for: ${title}`}
          className="w-full h-auto"
        />
      </div>
      <Button onClick={handleDownload} variant="outline" className="text-xs">
        Download Banner
      </Button>
    </div>
  );
}
