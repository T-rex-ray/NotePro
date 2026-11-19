import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardList, FileText, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { formatDateTime, notePreview, noteTitle, type Note } from '../lib/notes';
import NoteContextMenu, { type ContextAction } from './NoteContextMenu';

interface NotesListProps {
  notes: Note[];
  dark: boolean;
  startupMode: 'quick' | 'list';
  onOpen: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
  onChangeStartupMode: (mode: 'quick' | 'list') => void;
  onDelete?: (id: string) => void;
}

const LONG_PRESS_MS = 450;

export default function NotesList({
  notes,
  dark,
  startupMode,
  onOpen,
  onCreate,
  onToggleTheme,
  onChangeStartupMode,
  onDelete,
}: NotesListProps) {
  const [query, setQuery] = useState('');
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Рефы для точного определения долгого нажатия без ложных срабатываний при прокрутке
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressedRef = useRef(false);

  const clearPressTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPressTimer();
  }, [clearPressTimer]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const handleTouchStart = (id: string, e: React.TouchEvent | React.MouseEvent) => {
    longPressedRef.current = false;
    clearPressTimer();

    if ('touches' in e && e.touches.length > 0) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }

    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      setMenuNoteId(id);
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPosRef.current || timerRef.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - startPosRef.current.x);
    const dy = Math.abs(touch.clientY - startPosRef.current.y);
    // Если палец сдвинулся больше чем на 10px — пользователь листает список, отменяем меню
    if (dx > 10 || dy > 10) {
      clearPressTimer();
    }
  };

  const handleCardClick = (id: string) => {
    clearPressTimer();
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onOpen(id);
  };

  const handleMenuAction = async (action: ContextAction, note: Note) => {
    setMenuNoteId(null);

    if (action === 'share') {
      const text = note.title.trim() ? `${note.title.trim()}\n\n${note.content}` : note.content;
      try {
        if (navigator.share) {
          await navigator.share({ title: noteTitle(note), text });
        } else {
          await navigator.clipboard.writeText(text);
          setToast('Скопировано в буфер обмена');
        }
      } catch {
        // отменено пользователем
      }
      return;
    }

    if (action === 'delete' && onDelete) {
      onDelete(note.id);
      return;
    }

    const names: Record<ContextAction, string> = {
      select: 'Отметить',
      duplicate: 'Дублировать',
      pin: 'Закрепить сверху',
      share: 'Отправить',
      lock: 'Заблокировать',
      archive: 'Архивировать',
      delete: 'Удалить',
      color: 'Цвет карточки',
      remind: 'Напоминание',
      pdf: 'Экспорт в PDF',
    };
    setToast(`Функция «${names[action]}» — добавим следующим шагом`);
  };

  const activeMenuNote = useMemo(
    () => notes.find((n) => n.id === menuNoteId) ?? null,
    [notes, menuNoteId]
  );

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
            {filtered.map((n) => {
              const isSelected = n.id === menuNoteId;
              return (
                <li key={n.id}>
                  <button
                    onTouchStart={(e) => handleTouchStart(n.id, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={clearPressTimer}
                    onTouchCancel={clearPressTimer}
                    onMouseDown={(e) => handleTouchStart(n.id, e)}
                    onMouseUp={clearPressTimer}
                    onMouseLeave={clearPressTimer}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => handleCardClick(n.id)}
                    className={`w-full select-none rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/30 dark:border-teal-400 dark:bg-teal-950/40'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600'
                    }`}
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
              );
            })}
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

      {/* Двухрядная панель действий по удержанию */}
      <NoteContextMenu
        note={activeMenuNote}
        onClose={() => setMenuNoteId(null)}
        onAction={handleMenuAction}
