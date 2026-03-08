'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BriefData {
  primaryKeyword: string;
  secondaryKeywords: string[];
  h1: string;
  outline: { h2: string; h3s?: string[] }[];
  targetWordCount: { min: number; max: number };
  searchIntent: 'informational' | 'commercial' | 'transactional';
  keyPoints: string[];
}

interface BriefOutputProps {
  data: BriefData;
  onNext: () => void;
  onBriefUpdate: (updatedBrief: BriefData) => void;
  sessionId: string;
  nextLoading?: boolean;
}

export function BriefOutput({ data, onNext, onBriefUpdate, sessionId, nextLoading }: BriefOutputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BriefData>(data);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(data)));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNewKeyword('');
    setNewKeyPoint('');
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/brief/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, brief: draft }),
      });
      const json = await res.json();
      if (json.success) {
        onBriefUpdate(draft);
        setEditing(false);
      }
    } catch {
      // silently fail, keep edit mode
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setDraft({ ...draft, secondaryKeywords: [...draft.secondaryKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (idx: number) => {
    setDraft({ ...draft, secondaryKeywords: draft.secondaryKeywords.filter((_, i) => i !== idx) });
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setDraft({ ...draft, keyPoints: [...draft.keyPoints, newKeyPoint.trim()] });
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (idx: number) => {
    setDraft({ ...draft, keyPoints: draft.keyPoints.filter((_, i) => i !== idx) });
  };

  const updateOutlineH2 = (idx: number, value: string) => {
    const outline = [...draft.outline];
    outline[idx] = { ...outline[idx], h2: value };
    setDraft({ ...draft, outline });
  };

  const updateOutlineH3 = (sIdx: number, hIdx: number, value: string) => {
    const outline = [...draft.outline];
    const h3s = [...(outline[sIdx].h3s || [])];
    h3s[hIdx] = value;
    outline[sIdx] = { ...outline[sIdx], h3s };
    setDraft({ ...draft, outline });
  };

  const removeH3 = (sIdx: number, hIdx: number) => {
    const outline = [...draft.outline];
    const h3s = (outline[sIdx].h3s || []).filter((_, i) => i !== hIdx);
    outline[sIdx] = { ...outline[sIdx], h3s };
    setDraft({ ...draft, outline });
  };

  const addH3 = (sIdx: number) => {
    const outline = [...draft.outline];
    const h3s = [...(outline[sIdx].h3s || []), ''];
    outline[sIdx] = { ...outline[sIdx], h3s };
    setDraft({ ...draft, outline });
  };

  const addSection = () => {
    setDraft({ ...draft, outline: [...draft.outline, { h2: '', h3s: [] }] });
  };

  const removeSection = (idx: number) => {
    setDraft({ ...draft, outline: draft.outline.filter((_, i) => i !== idx) });
  };

  // ===== VIEW MODE =====
  if (!editing) {
    return (
      <Card
        title="Content Brief"
        stageNumber={2}
        status="completed"
        action={
          <div className="flex items-center gap-2">
            <Button onClick={startEdit} variant="outline">Edit Brief</Button>
            <Button onClick={onNext} loading={nextLoading} loadingText="Generating Draft...">
              Generate First Draft
            </Button>
          </div>
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

          <div>
            <span className="font-semibold text-gray-700">Target Word Count:</span>
            <p className="text-gray-600">{data.targetWordCount.min.toLocaleString()} &ndash; {data.targetWordCount.max.toLocaleString()} words</p>
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

  // ===== EDIT MODE =====
  return (
    <Card
      title="Content Brief"
      stageNumber={2}
      status="active"
      badge={<Badge variant="warning">Editing</Badge>}
      action={
        <div className="flex items-center gap-2">
          <Button onClick={cancelEdit} variant="outline">Cancel</Button>
          <Button onClick={saveEdit} loading={saving} loadingText="Saving...">Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        {/* H1 */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Recommended H1:</label>
          <input
            type="text"
            value={draft.h1}
            onChange={(e) => setDraft({ ...draft, h1: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Search Intent */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Search Intent:</label>
          <select
            value={draft.searchIntent}
            onChange={(e) => setDraft({ ...draft, searchIntent: e.target.value as BriefData['searchIntent'] })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="informational">Informational</option>
            <option value="commercial">Commercial</option>
            <option value="transactional">Transactional</option>
          </select>
        </div>

        {/* Secondary Keywords */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Secondary Keywords:</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {draft.secondaryKeywords.map((kw, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {kw}
                <button onClick={() => removeKeyword(i)} className="text-blue-400 hover:text-blue-700 ml-0.5" aria-label={`Remove ${kw}`}>&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={addKeyword} variant="outline" className="text-xs px-3 py-1.5">Add</Button>
          </div>
        </div>

        {/* Outline */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Article Outline:</label>
          <div className="space-y-3">
            {draft.outline.map((section, sIdx) => (
              <div key={sIdx} className="pl-3 border-l-2 border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">H2:</span>
                  <input
                    type="text"
                    value={section.h2}
                    onChange={(e) => updateOutlineH2(sIdx, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={() => removeSection(sIdx)} className="text-red-400 hover:text-red-600 text-xs" aria-label="Remove section">&times;</button>
                </div>
                {section.h3s?.map((h3, hIdx) => (
                  <div key={hIdx} className="flex items-center gap-2 ml-6">
                    <span className="text-xs text-gray-400">H3:</span>
                    <input
                      type="text"
                      value={h3}
                      onChange={(e) => updateOutlineH3(sIdx, hIdx, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={() => removeH3(sIdx, hIdx)} className="text-red-400 hover:text-red-600 text-xs" aria-label="Remove H3">&times;</button>
                  </div>
                ))}
                <button onClick={() => addH3(sIdx)} className="ml-6 text-xs text-indigo-500 hover:text-indigo-700">+ Add H3</button>
              </div>
            ))}
          </div>
          <button onClick={addSection} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add H2 Section</button>
        </div>

        {/* Word Count */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Target Word Count:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={draft.targetWordCount.min}
              onChange={(e) => setDraft({ ...draft, targetWordCount: { ...draft.targetWordCount, min: parseInt(e.target.value) || 0 } })}
              className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400">&ndash;</span>
            <input
              type="number"
              value={draft.targetWordCount.max}
              onChange={(e) => setDraft({ ...draft, targetWordCount: { ...draft.targetWordCount, max: parseInt(e.target.value) || 0 } })}
              className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 text-xs">words</span>
          </div>
        </div>

        {/* Key Points */}
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Key Points to Cover:</label>
          <div className="space-y-1.5 mb-2">
            {draft.keyPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const pts = [...draft.keyPoints];
                    pts[i] = e.target.value;
                    setDraft({ ...draft, keyPoints: pts });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => removeKeyPoint(i)} className="text-red-400 hover:text-red-600 text-xs" aria-label="Remove point">&times;</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyPoint}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
              placeholder="Add key point..."
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={addKeyPoint} variant="outline" className="text-xs px-3 py-1.5">Add</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
