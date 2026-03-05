import { v4 as uuidv4 } from 'uuid';
import { PipelineState } from '@/types/pipeline';

const sessions = new Map<string, PipelineState>();

export function createSession(): PipelineState {
  const sessionId = `sess_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const session: PipelineState = {
    sessionId,
    createdAt: new Date().toISOString(),
    keyword: '',
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): PipelineState | null {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId: string, updates: Partial<PipelineState>): PipelineState | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const updated = { ...session, ...updates };
  sessions.set(sessionId, updated);
  return updated;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}
