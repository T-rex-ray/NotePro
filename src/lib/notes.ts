export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Settings {
  startupMode: 'quick' | 'list';
  theme: 'light' | 'dark';
}

const NOTES_KEY = 'notepad.notes.v1';
const SETTINGS_KEY = 'notepad.settings.v1';

export const DEFAULT_SETTINGS: Settings = { startupMode: 'quick', theme: 'light' };

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function loadNotes(): Note[] {
  const notes = readJson<Note[]>(NOTES_KEY);
  if (!Array.isArray(notes)) return [];
  return notes.filter(
    (n) => n && typeof n.id === 'string' && typeof n.content === 'string'
  );
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export function loadSettings(): Settings {
  const s = readJson<Partial<Settings>>(SETTINGS_KEY);
  if (!s) return DEFAULT_SETTINGS;
  return {
    startupMode: s.startupMode === 'list' ? 'list' : 'quick',
    theme: s.theme === 'dark' ? 'dark' : 'light',
  };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function makeNote(title = '', content = ''): Note {
  const now = Date.now();
  return { id: crypto.randomUUID(), title, content, createdAt: now, updatedAt: now };
}

export function noteTitle(note: Note): string {
  const t = note.title.trim();
  if (t) return t;
  const first = note.content.trimStart().split('\n', 1)[0].trim();
  return first || 'Без заголовка';
}

export function notePreview(note: Note, len = 120): string {
  const body = note.title.trim()
    ? note.content.trim()
    : note.content.trimStart().split('\n').slice(1).join(' ').trim();
  const src = body || note.content.trim();
  return src.length > len ? src.slice(0, len) + '…' : src;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Сегодня, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Вчера, ${time}`;
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return `${date}, ${time}`;
}
