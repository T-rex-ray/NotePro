import { useEffect, useRef } from 'react';
import { ChevronDown, Moon, Search, Settings, Sun, X } from 'lucide-react';
import { NOTE_COLORS, type NoteColor, type SortBy } from '../lib/notes';
interface NotesHeaderProps {
  dark: boolean;
  searchOpen: boolean;
  query: string;
  sortBy: SortBy;
  colorFilter: NoteColor | 'all';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onQueryChange: (val: string) => void;
  onCloseSearch: () => void;
  onOpenSheet: () => void;
}
const SORT_LABELS: Record<SortBy, string> = {
  updated: 'Сортировать по дате изменения',
  created: 'Сортировать по дате создания',
  alpha: 'Сортировать по алфавиту',
  color: 'Сортировать по цвету',
  remind: 'Сортировать по дате напоминания',
};
export default function NotesHeader(p: NotesHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (p.searchOpen) inputRef.current?.focus(); }, [p.searchOpen]);
  const stripe = NOTE_COLORS.find((c) => c.id === p.colorFilter)?.stripe ?? '';
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}>
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="select-none text-3xl font-bold tracking-wide text-slate-900 dark:text-white" style={{ fontFamily: "'Caveat', cursive" }}>
          MyNote<span className="text-teal-600 dark:text-teal-400">Pro</span>
        </h1>
        <div className="flex items-center gap-0.5">
          <button onClick={p.onToggleTheme} aria-label="Тема" className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800">
            {p.dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={p.onOpenSettings} aria-label="Настройки" className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800">
            <Settings size={20} />
          </button>
        </div>
      </div>
      {p.searchOpen && (
        <div className="relative px-4 pb-2.5">
          <Search size={17} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input ref={inputRef} type="text" value={p.query} onChange={(e) => p.onQueryChange(e.target.value)} placeholder="Поиск заметок…" className="w-full rounded-full border border-teal-500/60 bg-slate-100 py-2 pl-10 pr-10 text-sm outline-none transition focus:bg-white dark:border-teal-500/40 dark:bg-slate-800 dark:focus:bg-slate-800" />
          <button onClick={p.onCloseSearch} aria-label="Закрыть" className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400">
            <X size={16} />
          </button>
        </div>
      )}
      <button type="button" onClick={p.onOpenSheet} className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/80 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
        <span>{SORT_LABELS[p.sortBy]}</span>
        {p.colorFilter !== 'all' && <span className={`h-2.5 w-2.5 rounded-full ${stripe}`} />}
        <ChevronDown size={13} />
      </button>
    </header>
  );
}
