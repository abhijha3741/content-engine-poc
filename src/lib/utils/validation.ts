export function validateKeyword(keyword: string): { valid: boolean; error?: string } {
  const trimmed = (keyword || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Keyword is required.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Keyword must be at least 3 characters long.' };
  }
  if (trimmed.length > 200) {
    return { valid: false, error: 'Keyword must be at most 200 characters long.' };
  }
  return { valid: true };
}

export function validateMetaDescription(desc: string): { valid: boolean; error?: string } {
  if (desc.length < 140) {
    return { valid: false, error: 'Meta description must be at least 140 characters.' };
  }
  if (desc.length > 160) {
    return { valid: false, error: 'Meta description must be at most 160 characters.' };
  }
  return { valid: true };
}
