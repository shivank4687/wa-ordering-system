import type { Session } from '../types/session';
import { readJSON, writeJSON } from '../lib/db/jsonDb';

const SESSION_DB_PATH = 'data/sessions.json';

type Sessions = Record<string, Session>;

const loadSessions = async (): Promise<Sessions> => {
  return readJSON<Sessions>(SESSION_DB_PATH);
};

const persistSessions = async (sessions: Sessions): Promise<void> => {
  await writeJSON(SESSION_DB_PATH, sessions);
};

export const getSession = async (phone: string): Promise<Session | null> => {
  const sessions = await loadSessions();
  return sessions[phone] ?? null;
};

export const setSession = async (phone: string, data: Session): Promise<Session> => {
  const sessions = await loadSessions();
  const updated = { ...sessions, [phone]: { ...data, updatedAt: Date.now() } };
  await persistSessions(updated);
  return updated[phone];
};

export const clearSession = async (phone: string): Promise<void> => {
  const sessions = await loadSessions();
  if (!(phone in sessions)) {
    return;
  }

  const { [phone]: _, ...rest } = sessions;
  await persistSessions(rest);
};
