'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ReviewModeProps {
  title: string;
  metaDescription: string;
  estimatedReadTime: number;
  wordCount: number;
  bodyHtml: string;
  thumbnailDataUrl?: string;
  keywords: { primary: string; secondary: string[] };
  eeatAudit?: {
    experience: { rating: string; suggestions: string[] };
    expertise: { rating: string; suggestions: string[] };
    authoritativeness: { rating: string; suggestions: string[] };
    trustworthiness: { rating: string; suggestions: string[] };
  };
  techniqueNotes?: string[];
  fullHtmlDocument: string;
  onClose: () => void;
}

function RatingColor(rating: string) {
  if (rating === 'Strong') return 'bg-green-500';
  if (rating === 'Moderate') return 'bg-blue-500';
  return 'bg-amber-500';
}

export function ReviewMode({
  title,
  metaDescription,
  estimatedReadTime,
  wordCount,
  bodyHtml,
  thumbnailDataUrl,
  keywords,
  eeatAudit,
  techniqueNotes,
  fullHtmlDocument,
  onClose,
}: ReviewModeProps) {
  const handleDownload = () => {
    const blob = new Blob([fullHtmlDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bodyHtml);
      alert('HTML copied to clipboard!');
    } catch {
      alert('Failed to copy.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Article Review</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" className="text-xs">Download HTML</Button>
            <Button onClick={handleCopy} variant="secondary" className="text-xs">Copy HTML</Button>
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-600 text-xl leading-none focus:outline-none"
              aria-label="Close review"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white">
          {/* Banner */}
          {thumbnailDataUrl && (
            <div className="w-full max-h-[350px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailDataUrl} alt="Article banner" className="w-full h-auto" />
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">{title}</h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
              <span>{wordCount.toLocaleString()} words</span>
              <span>&middot;</span>
              <span>{estimatedReadTime} min read</span>
              <span>&middot;</span>
              <Badge variant="default">{keywords.primary}</Badge>
              {keywords.secondary.map((kw, i) => (
                <Badge key={i} variant="info">{kw}</Badge>
              ))}
            </div>

            {/* Meta description */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">Meta Description</span>
              <p className="text-gray-600 mt-1">{metaDescription}</p>
            </div>

            {/* EEAT Scores */}
            {eeatAudit && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">E-E-A-T Quality Scores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    ['Experience', eeatAudit.experience],
                    ['Expertise', eeatAudit.expertise],
                    ['Authority', eeatAudit.authoritativeness],
                    ['Trust', eeatAudit.trustworthiness],
                  ] as [string, { rating: string }][]).map(([name, dim]) => (
                    <div key={name} className="text-center">
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white text-xs font-bold ${RatingColor(dim.rating)}`}>
                        {dim.rating === 'Strong' ? 'S' : dim.rating === 'Moderate' ? 'M' : 'W'}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{name}</p>
                      <p className="text-xs font-medium text-gray-800">{dim.rating}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article body */}
            <article className="prose prose-sm max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </article>

            {/* Humanization notes */}
            {techniqueNotes && techniqueNotes.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-indigo-800 text-sm mb-2">Humanization Techniques Applied</h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  {techniqueNotes.map((note, i) => (
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
      </div>
    </div>
  );
}
