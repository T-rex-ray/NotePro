export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'charcoal'
  | 'gray'
  | 'white';
export type SortBy = 'updated' | 'created' | 'alpha' | 'color' | 'remind';
export type ViewMode = 'list' | 'details' | 'grid' | 'large-grid';
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  color?: NoteColor;
  remindAt?: number;
}
export interface Settings {
  startupMode: 'quick' | 'list';
  theme: 'light' | 'dark';
  sortBy: SortBy;
  viewMode: ViewMode;
}
export const NOTE_COLORS: { id: NoteColor; label: string; stripe: string; swatch: string; order: number }[] = [
  { id: 'default', label: 'Без цвета', stripe: 'bg-teal-500/70', swatch: 'bg-slate-200 dark:bg-slate-700', order: 0 },
  { id: 'red', label: 'Красный', stripe: 'bg-red-600', swatch: 'bg-red-700', order: 1 },
  { id: 'orange', label: 'Оранжевый', stripe: 'bg-orange-500', swatch: 'bg-orange-600', order: 2 },
  { id: 'yellow', label: 'Жёлтый', stripe: 'bg-amber-400', swatch: 'bg-amber-500', order: 3 },
  { id: 'green', label: 'Зелёный', stripe: 'bg-emerald-600', swatch: 'bg-emerald-700', order: 4 },
  { id: 'blue', label: 'Синий', stripe: 'bg-blue-600', swatch: 'bg-blue-700', order: 5 },
  { id: 'purple', label: 'Фиолетовый', stripe: 'bg-purple-600', swatch: 'bg-purple-700', order: 6 },
  { id: 'charcoal', label: 'Графит', stripe: 'bg-slate-800 dark:bg-slate-950', swatch: 'bg-slate-800', order: 7 },
  { id: 'gray', label: 'Серый', stripe: 'bg-slate-400', swatch: 'bg-slate-400', order: 8 },
  { id: 'white', label: 'Белый', stripe: 'bg-slate-100 border border-slate-300', swatch: 'bg-slate-100', order: 9 },
];
const NOTES_KEY = 'notepad.notes.v1';
const SETTINGS_KEY = 'notepad.settings.v1';
export const DEFAULT_SETTINGS: Settings = {
  startupMode: 'quick',
  theme: 'light',
  sortBy: 'updated',
  viewMode: 'details',
};
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
  return notes.filter((n) => n && typeof n.id === 'string' && typeof n.content === 'string');
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
    sortBy: s.sortBy ?? 'updated',
    viewMode: s.viewMode ?? 'details',
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
  return { id: crypto.randomUUID(), title, content, createdAt: now, updatedAt: now, color: 'default' };
}
export function noteTitle(note: Note): string {
  const t = note.title.trim();
  if (t) return t;
  const first = (note.content.trimStart().split('\n').shift() ?? '').trim();
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
