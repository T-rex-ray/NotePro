import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Moon, Palette, Search, Settings, Sun, X } from 'lucide-react';
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
  const [styleToast, setStyleToast] = useState(false);
  useEffect(() => { if (p.searchOpen) inputRef.current?.focus(); }, [p.searchOpen]);
  useEffect(() => {
    if (!styleToast) return;
    const t = window.setTimeout(() => setStyleToast(false), 2000);
    return () => window.clearTimeout(t);
  }, [styleToast]);
  const stripe = NOTE_COLORS.find((c) => c.id === p.colorFilter)?.stripe ?? '';
  const aquaBtn = 'relative overflow-hidden border-2 border-teal-600/45 bg-gradient-to-b from-teal-50 via-teal-100/90 to-teal-200/90 text-teal-900 shadow-[0_4px_8px_rgba(15,118,110,0.28),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(13,148,136,0.35)] transition-all active:scale-95 active:shadow-[0_1px_3px_rgba(15,118,110,0.3),inset_0_2px_4px_rgba(13,148,136,0.4)] dark:border-teal-400/35 dark:from-teal-800/90 dark:via-slate-800 dark:to-slate-900 dark:text-teal-200 dark:shadow-[0_4px_10px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_5px_rgba(0,0,0,0.6)]';
  const gloss = <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/85 to-white/10 dark:from-white/25 dark:to-transparent" />;
  return (
    <header className="sticky top-0 z-10 bg-transparent">
      <div
        className="relative overflow-hidden rounded-b-xl border-b border-teal-200/70 bg-teal-100/85 pl-3.5 pr-12 pb-2 shadow-xs backdrop-blur dark:border-teal-800/50 dark:bg-teal-950/85"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.45rem)' }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-teal-800 opacity-[0.14] dark:text-teal-300 dark:opacity-[0.15]"
          xmlns="http://w3.org"
        >
          <defs>
            <pattern id="header-micro-pattern" width="36" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
              <text x="1" y="7" fill="currentColor" fontSize="5.5" fontWeight="700" fontFamily="'Caveat', cursive" letterSpacing="0.3">
                MyNotePro
              </text>
              <text x="19" y="16" fill="currentColor" fontSize="5.5" fontWeight="700" fontFamily="'Caveat', cursive" letterSpacing="0.3">
                MyNotePro
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#header-micro-pattern)" />
        </svg>
        <div className="relative z-10 flex items-center justify-between">
          <h1 className="select-none text-[27px] leading-none font-bold tracking-wide text-slate-900 dark:text-white" style={{ fontFamily: "'Caveat', cursive" }}>
            MyNote<span className="text-teal-600 dark:text-teal-400">Pro</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={p.onToggleTheme} aria-label="День / Ночь" className={`flex h-9 w-9 items-center justify-center rounded-full ${aquaBtn}`}>
              {gloss}
              <span className="relative z-10">{p.dark ? <Sun size={18} strokeWidth={2.2} /> : <Moon size={18} strokeWidth={2.2} />}</span>
            </button>
            <button onClick={() => setStyleToast(true)} aria-label="Оформление" className={`flex h-9 w-9 items-center justify-center rounded-full ${aquaBtn}`}>
              {gloss}
              <span className="relative z-10"><Palette size={18} strokeWidth={2.2} /></span>
            </button>
          </div>
        </div>
        <button
          onClick={p.onOpenSettings}
          aria-label="Настройки"
          style={{ top: 'max(env(safe-area-inset-top), 0.25rem)' }}
          className={`!absolute bottom-1 right-1 z-20 flex w-9 items-center justify-center rounded-xl ${aquaBtn}`}
        >
          {gloss}
          <span className="relative z-10"><Settings size={18} strokeWidth={2.2} /></span>
        </button>
        {p.searchOpen && (
          <div className="relative z-10 mt-2">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-700/60 dark:text-teal-300/60" />
            <input ref={inputRef} type="text" value={p.query} onChange={(e) => p.onQueryChange(e.target.value)} placeholder="Поиск заметок…" className="w-full rounded-xl border border-teal-300/70 bg-white/85 py-1.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:bg-white dark:border-teal-700/60 dark:bg-slate-900/80 dark:text-white dark:focus:bg-slate-900" />
            <button onClick={p.onCloseSearch} aria-label="Закрыть" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-teal-200/40">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="px-3 pt-1">
        <button type="button" onClick={p.onOpenSheet} className="flex w-full items-center justify-center gap-1 rounded-xl bg-white/80 py-0.5 text-[11px] font-medium text-slate-500 backdrop-blur-xs transition hover:bg-white active:scale-[0.99] dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800">
          <span>{SORT_LABELS[p.sortBy]}</span>
          {p.colorFilter !== 'all' && <span className={`h-2 w-2 rounded-full ${stripe}`} />}
          <ChevronDown size={12} />
        </button>
      </div>
      {styleToast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-6">
          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">Настройка оформления — добавим следующим шагом</span>
        </div>
      )}
    </header>
  );
}
