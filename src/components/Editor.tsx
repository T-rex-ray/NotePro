import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, List, Moon, Pencil, Share2, Sun, Trash2 } from 'lucide-react';
import { formatDateTime, type Note } from '../lib/notes';

interface EditorProps {
  note: Note;
  notesCount: number;
  dark: boolean;
  savedJustNow: boolean;
  viewing: boolean;
  onBack: () => void;
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
  onOpenList,
  onStartEdit,
  onChange,
  onDelete,
  onToggleTheme,
}: EditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const lastTapRef = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // При входе в редактирование ставим фокус и курсор в конец текста
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
      // В режиме просмотра оставляем двойной тап для перехода в редактирование
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

      // В режиме редактирования тап по любому пустому месту экрана фокусирует поле ввода и открывает клавиатуру
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
        await navigator.share({ title: note.title.trim() || 'Заметка', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setToast('Текст скопирован в буфер обмена');
      }
    } catch {
      // пользователь отменил отправку
    }
  }, [note.title, note.content]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header
        className="sticky top-0 z-10 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 pt-[env(safe-area-inset-top)] pb-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <button
          onClick={onBack}
          aria-label="Назад"
          className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={22} />
        </button>
        <button
          onClick={onOpenList}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 active:scale-95 dark:text-teal-300 dark:hover:bg-slate-800"
        >
          <List size={18} />
          Мои заметки
          <span className="min-w-[1.75rem] rounded-full bg-teal-100 px-1.5 text-center text-xs font-semibold leading-6 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
            {notesCount}
          </span>
        </button>
        <div className="ml-auto flex items-center">
          <button
            onClick={onToggleTheme}
            aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
            className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {viewing && (
            <button
              onClick={onStartEdit}
              aria-label="Редактировать заметку"
              className="rounded-full bg-teal-100 p-[0.875rem] text-teal-700 transition hover:bg-teal-200 active:scale-95 dark:bg-teal-900 dark:text-teal-200 dark:hover:bg-teal-800"
            >
              <Pencil size={23} />
            </button>
          )}
          <button
            onClick={share}
            aria-label="Поделиться"
            className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? <Check size={20} className="text-teal-600" /> : <Share2 size={20} />}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            aria-label="Удалить заметку"
            className="rounded-full p-2.5 text-red-500 transition hover:bg-red-50 active:scale-95 dark:hover:bg-red-950"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3 pb-6"
        onClick={handleMainClick}
      >
        <input
          type="text"
          value={note.title}
          readOnly={viewing}
          tabIndex={viewing ? -1 : 0}
          className={
            viewing
              ? 'pointer-events-none w-full shrink-0 bg-transparent text-xl font-semibold outline-none'
              : 'w-full shrink-0 bg-transparent text-xl font-semibold placeholder-slate-400 outline-none dark:placeholder-slate-500'
          }
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Заголовок (необязательно)"
        />
        <div className="mt-1 shrink-0 pb-2 text-xs text-slate-400 dark:text-slate-500">
          Изменено: {formatDateTime(note.updatedAt)}
        </div>
        <textarea
          ref={contentRef}
          value={note.content}
          readOnly={viewing}
          tabIndex={viewing ? -1 : 0}
          className={
            viewing
              ? 'pointer-events-none w-full flex-1 resize-none bg-transparent text-[17px] leading-relaxed outline-none'
              : 'w-full flex-1 resize-none bg-transparent text-[17px] leading-relaxed placeholder-slate-400 outline-none dark:placeholder-slate-500'
          }
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Начните писать…"
        />
      </main>

      <footer className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 text-xs text-slate-500 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-400">
        {viewing ? (
          <span>Режим просмотра</span>
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
          <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-700">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
