import { useMemo, useState } from 'react';
import { ClipboardList, FileText, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { formatDateTime, notePreview, noteTitle, type Note } from '../lib/notes';

interface NotesListProps {
  notes: Note[];
  dark: boolean;
  startupMode: 'quick' | 'list';
  onOpen: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
  onChangeStartupMode: (mode: 'quick' | 'list') => void;
}

export default function NotesList({
  notes,
  dark,
  startupMode,
  onOpen,
  onCreate,
  onToggleTheme,
  onChangeStartupMode,
}: NotesListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <div className="flex items-center justify-between pb-2">
          <h1 className="text-xl font-bold">Мои заметки</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="relative pb-2">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск заметок…"
            className="w-full rounded-full border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-600 dark:bg-slate-800 dark:focus:bg-slate-800"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => onChangeStartupMode(startupMode === 'quick' ? 'list' : 'quick')}
          className="mb-3 flex w-full items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 text-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ClipboardList size={16} />
            Режим запуска
          </span>
          <span className="font-medium text-teal-700 dark:text-teal-300">
            {startupMode === 'quick' ? 'Быстрая запись' : 'Список заметок'}
          </span>
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-3">
        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center text-slate-400 dark:text-slate-500">
            <FileText size={48} strokeWidth={1.5} />
            <p className="mt-4 text-sm">
              {query ? 'Ничего не найдено' : 'Пока нет заметок.\nНажмите «+», чтобы создать первую.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => onOpen(n.id)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">
                      {noteTitle(n)}
                    </h2>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                      {formatDateTime(n.updatedAt)}
                    </span>
                  </div>
                  {notePreview(n) && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {notePreview(n)}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <button
        onClick={onCreate}
        aria-label="Новая заметка"
        className="fixed bottom-6 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 active:scale-90"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
