'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ExportOutputProps {
  data: {
    title: string;
    metaDescription: string;
    metaDescriptionLength: number;
    estimatedReadTime: number;
    bodyHtml: string;
    wordCount: number;
    keywords: {
      primary: string;
      secondary: string[];
    };
    fullHtmlDocument: string;
  };
}

export function ExportOutput({ data }: ExportOutputProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([data.fullHtmlDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.bodyHtml);
      alert('HTML copied to clipboard!');
    } catch {
      alert('Failed to copy. Please try the download option.');
    }
  };

  const metaPercent = Math.min(100, (data.metaDescriptionLength / 160) * 100);
  const metaOk = data.metaDescriptionLength >= 140 && data.metaDescriptionLength <= 160;

  return (
    <>
      <Card title="Export / Publish Ready" stageNumber={6} status="completed">
        <div className="space-y-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Title:</span>
            <p className="text-gray-800 font-medium">{data.title}</p>
          </div>

          <div>
            <span className="font-semibold text-gray-700">Meta Description:</span>
            <p className="text-gray-600 mt-1">{data.metaDescription}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[200px]">
                <div
                  className={`h-1.5 rounded-full ${metaOk ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${metaPercent}%` }}
                />
              </div>
              <span className={`text-xs ${metaOk ? 'text-green-600' : 'text-amber-600'}`}>
                {data.metaDescriptionLength} chars {metaOk ? '(within limit)' : '(outside 140-160 range)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-gray-700">Read Time:</span>
              <p className="text-gray-600">~{data.estimatedReadTime} minutes</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Word Count:</span>
              <p className="text-gray-600">{data.wordCount.toLocaleString()} words</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => setShowPreview(true)} variant="primary">
              Preview Article
            </Button>
            <Button onClick={handleDownload} variant="outline" aria-label="Download HTML file">
              Download HTML
            </Button>
            <Button onClick={handleCopy} variant="secondary" aria-label="Copy to clipboard">
              Copy HTML
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Article Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-xl focus:outline-none"
                aria-label="Close preview"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4 border-b text-sm text-gray-500">
              {data.wordCount.toLocaleString()} words &middot; {data.estimatedReadTime} min read
            </div>
            <article className="px-6 py-6 prose prose-sm max-w-none">
              <h1>{data.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
            </article>
          </div>
        </div>
      )}
    </>
  );
}
