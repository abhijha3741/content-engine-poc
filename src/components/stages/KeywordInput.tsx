'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface KeywordInputProps {
  onSubmit: (keyword: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function KeywordInput({ onSubmit, loading = false, disabled = false }: KeywordInputProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim().length >= 3) {
      onSubmit(keyword.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
        What topic do you want to create content for?
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        e.g. &quot;remote work tools&quot;, &quot;AI for HR&quot;, &quot;content marketing for SaaS&quot;
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter a keyword or topic..."
            maxLength={200}
            disabled={disabled || loading}
            aria-label="Enter keyword or topic"
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">{keyword.length} / 200</p>
        </div>
        <Button
          type="submit"
          disabled={keyword.trim().length < 3 || disabled}
          loading={loading}
          loadingText="Researching..."
          aria-label="Start content research"
        >
          Start Research
        </Button>
      </form>
    </div>
  );
}
