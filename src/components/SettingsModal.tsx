import { useState } from 'react';
import { ArrowLeft, ChevronRight, ClipboardList, RotateCcw, Trash2, X } from 'lucide-react';
import { formatDateTime, notePreview, noteTitle, type Note } from '../lib/notes';

interface SettingsModalProps {
  open: boolean;
  trashedNotes: Note[];
  startupMode: 'quick' | 'list';
  onClose: () => void;
  onChangeStartupMode: (mode: 'quick' | 'list') => void;
  onRestoreNote: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onEmptyTrash: () => void;
}

export default function SettingsModal({
  open,
  trashedNotes,
  startupMode,
  onClose,
  onChangeStartupMode,
  onRestoreNote,
  onDeleteForever,
  onEmptyTrash,
}: SettingsModalProps) {
  const [view, setView] = useState<'main' | 'trash'>('main');

  if (!open) return null;

  const handleClose = () => {
    setView('main');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header
        className="flex items-center justify-between border-b border-slate-200 bg-white px-4 pb-3 dark:border-slate-700 dark:bg-slate-900"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <div className="flex items-center gap-2">
          {view === 'trash' && (
            <button
              onClick={() => setView('main')}
              aria-label="Назад в настройки"
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold">
            {view === 'main' ? 'Настройки' : `Корзина (${trashedNotes.length})`}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          {view === 'trash' && trashedNotes.length > 0 && (
            <button
              onClick={onEmptyTrash}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Очистить всё
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Закрыть настройки"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        {view === 'main' ? (
          <div className="space-y-3">
            <button
              onClick={() => setView('trash')}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="font-semibold">Корзина</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Удалённые заметки: {trashedNotes.length}
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </button>

            <button
              onClick={() => onChangeStartupMode(startupMode === 'quick' ? 'list' : 'quick')}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div className="font-semibold">Режим запуска</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {startupMode === 'quick' ? 'Сразу новая заметка' : 'Открывать список'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                Изменить
              </span>
            </button>
          </div>
        ) : trashedNotes.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center text-slate-400 dark:text-slate-500">
            <Trash2 size={48} strokeWidth={1.4} />
            <p className="mt-4 text-sm">В корзине пока пусто</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {trashedNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 font-semibold">{noteTitle(n)}</h3>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDateTime(n.deletedAt ?? n.updatedAt)}
                  </span>
                </div>
                {notePreview(n) && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {notePreview(n)}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-700/70">
                  <button
                    onClick={() => onRestoreNote(n.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition active:scale-95 dark:bg-teal-950/60 dark:text-teal-300"
                  >
                    <RotateCcw size={14} />
                    Восстановить
                  </button>
                  <button
                    onClick={() => onDeleteForever(n.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition active:scale-95 dark:bg-red-950/60 dark:text-red-400"
                  >
                    <Trash2 size={14} />
                    Навсегда
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
