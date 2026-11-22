import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { formatDateTime, type Note } from '../lib/notes';
import EditorHeader from './EditorHeader';
import EditorOptionsBar, { type EditorOptionAction } from './EditorOptionsBar';
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
  savedJustNow,
  viewing,
  onBack,
  onFinishEdit,
  onStartEdit,
  onChange,
  onDelete,
}: EditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const lastTapRef = useRef(0);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const defaultPlaceholder = useMemo(() => `Заметка ${Math.max(1, notesCount)}`, [notesCount]);
  const autoTitle = useMemo(() => {
    const firstLine = note.content.trimStart().split('\n', 1)?.trim() ?? '';
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
      if (optionsOpen) {
        setOptionsOpen(false);
        return;
      }
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
    [viewing, onStartEdit, optionsOpen]
  );
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  const charCount = useMemo(() => note.content.length, [note.content]);
  const copyAll = useCallback(async () => {
    const text = note.title.trim()
      ? `${note.title.trim()}\n\n${note.content}`
      : note.content;
    if (!text.trim()) {
      setToast('Заметка пуста');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setToast('Текст заметки скопирован');
    } catch {
      setToast('Не удалось скопировать');
    }
  }, [note.title, note.content]);
  const handleOptionAction = useCallback(
    async (action: EditorOptionAction) => {
      setOptionsOpen(false);
      if (action === 'share') {
        const text = note.title.trim()
          ? `${note.title.trim()}\n\n${note.content}`
          : note.content;
        try {
          if (navigator.share) {
            await navigator.share({ title: displayTitle, text });
          } else {
            await navigator.clipboard.writeText(text);
            setToast('Скопировано для отправки');
          }
        } catch {
          // ignore
        }
        return;
      }
      setToast('Функция будет добавлена следующим шагом');
    },
    [note.title, note.content, displayTitle]
  );
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <EditorHeader
        title={note.title}
        placeholder={viewing ? displayTitle : autoTitle || defaultPlaceholder}
        viewing={viewing}
        copied={copied}
        optionsOpen={optionsOpen}
        onBack={onBack}
        onFinishEdit={onFinishEdit}
        onStartEdit={onStartEdit}
        onTitleChange={(val) => onChange({ title: val })}
        onCopyAll={copyAll}
        onDelete={() => onDelete(note.id)}
        onToggleOptions={() => setOptionsOpen((v) => !v)}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <EditorOptionsBar open={optionsOpen} onAction={handleOptionAction} />
        <main
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-1.5 pb-6"
          onClick={handleMainClick}
        >
          <div className="mb-1.5 flex shrink-0 items-center justify-between text-[10px] leading-none text-slate-400/80 dark:text-slate-500/80">
            <span>{viewing ? 'Просмотр' : 'Редактирование'}</span>
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
      </div>
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
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-6 transition-opacity ${
          toast ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">{toast}</span>
      </div>
    </div>
  );
}
