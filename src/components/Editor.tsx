import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Moon, Pencil, Share2, Sun, Trash2 } from 'lucide-react';
import { formatDateTime, type Note } from '../lib/notes';
interface EditorProps {
  note: Note;
  notesCount: number;
  dark: boolean;
  savedJustNow: boolean;
  viewing: boolean;
  onBack: () => void;
  onFinishEdit: () => void;
  onOpenList: () => void;
  onStartEdit: () => void;
  onChange: (patch: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToggleTheme: () => void;
}
export default function Editor({
  note,
  notesCount,
  dark,
  savedJustNow,
  viewing,
  onBack,
  onFinishEdit,
  onStartEdit,
  onChange,
  onDelete,
  onToggleTheme,
}: EditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const lastTapRef = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const defaultPlaceholder = useMemo(() => `Заметка ${Math.max(1, notesCount)}`, [notesCount]);
  const autoTitle = useMemo(() => {
    const firstLine = note.content.trimStart().split('\n', 1)[0]?.trim() ?? '';
    return firstLine.length > 28 ? `${firstLine.slice(0, 28)}…` : firstLine;
  }, [note.content]);
  const displayTitle = note.title.trim() || autoTitle || defaultPlaceholder;
  useEffect(() => {
    if (viewing) return;
    const el = contentRef.current;
    if (el) {
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }
  }, [note.id, viewing]);
  const handleMainClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (viewing) {
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          lastTapRef.current = 0;
          onStartEdit();
        } else {
          lastTapRef.current = now;
        }
        return;
      }
      if (e.target === e.currentTarget) {
        const el = contentRef.current;
        if (el) {
          el.focus();
          const end = el.value.length;
          el.setSelectionRange(end, end);
        }
      }
    },
    [viewing, onStartEdit]
  );
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  const charCount = useMemo(() => note.content.length, [note.content]);
  const share = useCallback(async () => {
    const text = note.title.trim()
      ? `${note.title.trim()}\n\n${note.content}`
      : note.content;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setToast('Текст скопирован в буфер обмена');
      }
    } catch {
      // ignore
    }
  }, [note.title, note.content, displayTitle]);
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header
        className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-2.5 pt-[env(safe-area-inset-top)] pb-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        {viewing ? (
          <button
            onClick={onBack}
            aria-label="Назад к списку"
            className="shrink-0 rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <button
            onClick={onFinishEdit}
            aria-label="Сохранить и завершить редактирование"
            className="shrink-0 rounded-full bg-teal-600 p-2.5 text-white shadow-sm transition hover:bg-teal-700 active:scale-95"
          >
            <Check size={20} strokeWidth={2.5} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {viewing ? (
            <div className="truncate rounded-2xl border border-slate-200/80 bg-slate-100/70 px-3.5 py-1.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100">
              {displayTitle}
            </div>
          ) : (
            <input
              type="text"
              value={note.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder={autoTitle || defaultPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100/90 px-3.5 py-1.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={onToggleTheme}
            aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          {viewing && (
            <button
              onClick={onStartEdit}
              aria-label="Редактировать заметку"
              className="rounded-full bg-teal-100 p-2.5 text-teal-700 transition hover:bg-teal-200 active:scale-95 dark:bg-teal-900 dark:text-teal-200 dark:hover:bg-teal-800"
            >
              <Pencil size={19} />
            </button>
          )}
          <button
            onClick={share}
            aria-label="Поделиться"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? <Check size={19} className="text-teal-600" /> : <Share2 size={19} />}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            aria-label="Удалить заметку"
            className="rounded-full p-2 text-red-500 transition hover:bg-red-50 active:scale-95 dark:hover:bg-red-950"
          >
            <Trash2 size={19} />
          </button>
        </div>
      </header>
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-2.5 pb-6"
        onClick={handleMainClick}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-400 dark:border-slate-700/80 dark:text-slate-500">
          <span className="font-medium text-teal-700/80 dark:text-teal-400/80">
            {viewing ? 'Просмотр' : 'Редактирование'}
          </span>
          <span>{formatDateTime(note.updatedAt)}</span>
        </div>
        {viewing ? (
          <div className="w-full flex-1 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-slate-800 dark:text-slate-200">
            {note.content || (
              <span className="text-slate-400 dark:text-slate-500">Пустая заметка</span>
            )}
          </div>
        ) : (
          <textarea
            ref={contentRef}
            value={note.content}
            className="w-full flex-1 resize-none bg-transparent text-[17px] leading-relaxed placeholder-slate-400 outline-none dark:placeholder-slate-500"
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Начните писать…"
          />
        )}
      </main>
      <footer className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 text-xs text-slate-500 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400">
        {viewing ? (
          <span>Двойной тап по тексту для правки</span>
        ) : (
          <>
            <span>{charCount} символов</span>
            <span
              className={`flex items-center gap-1 transition-opacity duration-500 ${
                savedJustNow ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Check size={14} className="text-teal-600 dark:text-teal-400" />
              Сохранено
            </span>
          </>
        )}
      </footer>
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-6">
          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}
