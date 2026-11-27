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
    <header className="sticky top-0 z-10 bg-slate-50/90 px-3 pb-1 backdrop-blur dark:bg-slate-900/90" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}>
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3.5 text-white shadow-md shadow-teal-600/20 dark:from-teal-900/90 dark:to-slate-800 dark:shadow-black/30">
        <div className="flex items-center justify-between">
          <h1 className="select-none text-3xl font-bold tracking-wide text-white" style={{ fontFamily: "'Caveat', cursive" }}>
            MyNote<span className="text-teal-200 dark:text-teal-400">Pro</span>
          </h1>
          <div className="flex items-center gap-0.5">
            <button onClick={p.onToggleTheme} aria-label="Тема" className="rounded-full p-2 text-white/90 transition hover:bg-white/15 active:scale-95">
              {p.dark ? <Sun size={21} /> : <Moon size={21} />}
            </button>
            <button onClick={p.onOpenSettings} aria-label="Настройки" className="rounded-full p-2 text-white/90 transition hover:bg-white/15 active:scale-95">
              <Settings size={21} />
            </button>
          </div>
        </div>
        {p.searchOpen && (
          <div className="relative mt-2.5">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70" />
            <input ref={inputRef} type="text" value={p.query} onChange={(e) => p.onQueryChange(e.target.value)} placeholder="Поиск заметок…" className="w-full rounded-xl border border-white/25 bg-white/15 py-2 pl-10 pr-9 text-sm text-white placeholder-white/70 outline-none transition focus:border-white/50 focus:bg-white/25" />
            <button onClick={p.onCloseSearch} aria-label="Закрыть" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 hover:bg-white/15">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      <button type="button" onClick={p.onOpenSheet} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white/85 py-1.5 text-xs font-medium text-slate-500 shadow-xs transition hover:bg-white active:scale-[0.99] dark:bg-slate-800/75 dark:text-slate-400 dark:hover:bg-slate-800">
        <span>{SORT_LABELS[p.sortBy]}</span>
        {p.colorFilter !== 'all' && <span className={`h-2.5 w-2.5 rounded-full ${stripe}`} />}
        <ChevronDown size={13} />
      </button>
    </header>
  );
}
