export function countWords(text: string): number {
  if (!text) return 0;
  // Strip HTML tags
  const stripped = text.replace(/<[^>]*>/g, '');
  // Strip markdown heading markers
  const cleaned = stripped.replace(/^#+\s*/gm, '');
  // Split by whitespace and filter empty strings
  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
