export function estimateReadTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
