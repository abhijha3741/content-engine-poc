import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session/store';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateGradientColors(keyword: string): { from: string; to: string; accent: string } {
  const hash = hashCode(keyword);
  const palettes = [
    { from: '#6366f1', to: '#a855f7', accent: '#c4b5fd' }, // indigo-purple
    { from: '#0ea5e9', to: '#6366f1', accent: '#93c5fd' }, // sky-indigo
    { from: '#10b981', to: '#0ea5e9', accent: '#6ee7b7' }, // emerald-sky
    { from: '#f59e0b', to: '#ef4444', accent: '#fcd34d' }, // amber-red
    { from: '#8b5cf6', to: '#ec4899', accent: '#c4b5fd' }, // violet-pink
    { from: '#14b8a6', to: '#6366f1', accent: '#5eead4' }, // teal-indigo
    { from: '#f97316', to: '#f59e0b', accent: '#fdba74' }, // orange-amber
    { from: '#3b82f6', to: '#10b981', accent: '#93c5fd' }, // blue-emerald
  ];
  return palettes[hash % palettes.length];
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // max 3 lines
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateBannerSvg(title: string, keyword: string): string {
  const colors = generateGradientColors(keyword);
  const titleLines = wrapText(title, 35);
  const hash = hashCode(keyword);

  // Generate decorative circles
  const circles: string[] = [];
  for (let i = 0; i < 12; i++) {
    const cx = ((hash * (i + 1) * 137) % 1200);
    const cy = ((hash * (i + 1) * 89) % 630);
    const r = 20 + ((hash * (i + 1)) % 60);
    circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors.accent}" opacity="0.12"/>`);
  }

  const titleY = 260 - ((titleLines.length - 1) * 25);
  const titleElements = titleLines.map((line, i) =>
    `<text x="600" y="${titleY + i * 55}" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="42" font-weight="700" letter-spacing="-0.5">${escapeXml(line)}</text>`
  ).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.from}"/>
      <stop offset="100%" style="stop-color:${colors.to}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0)" stop-opacity="0"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.3)" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#overlay)"/>

  <!-- Decorative elements -->
  ${circles.join('\n  ')}

  <!-- Decorative lines -->
  <line x1="80" y1="180" x2="180" y2="180" stroke="${colors.accent}" stroke-width="3" opacity="0.3"/>
  <line x1="1020" y1="450" x2="1120" y2="450" stroke="${colors.accent}" stroke-width="3" opacity="0.3"/>

  <!-- Title -->
  <g>
    ${titleElements}
  </g>

  <!-- Keyword subtitle -->
  <rect x="${600 - (keyword.length * 5 + 20)}" y="380" width="${keyword.length * 10 + 40}" height="36" rx="18" fill="white" opacity="0.2"/>
  <text x="600" y="404" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="16" font-weight="500" opacity="0.9">${escapeXml(keyword)}</text>

  <!-- Bottom bar -->
  <rect x="0" y="590" width="1200" height="40" fill="rgba(0,0,0,0.2)"/>
  <text x="600" y="616" text-anchor="middle" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="14" font-weight="400" opacity="0.7">Content Engine POC</text>
</svg>`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sessionId is required.', retryable: false } },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session not found.', retryable: false } },
        { status: 404 }
      );
    }

    if (!session.humanized) {
      return NextResponse.json(
        { success: false, error: { code: 'STAGE_NOT_READY', message: 'Stage 5 (Humanize) must be completed first.', retryable: false } },
        { status: 409 }
      );
    }

    const title = session.brief?.h1 || session.keyword;
    const svg = generateBannerSvg(title, session.keyword);
    const thumbnailDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    return NextResponse.json({
      success: true,
      data: {
        thumbnailSvg: svg,
        thumbnailDataUrl,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message, retryable: false } },
      { status: 500 }
    );
  }
}
