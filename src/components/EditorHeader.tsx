import { ArrowLeft, Check, Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react';
interface EditorHeaderProps {
  title: string;
  placeholder: string;
  viewing: boolean;
  copied: boolean;
  optionsOpen: boolean;
  onBack: () => void;
  onFinishEdit: () => void;
  onStartEdit: () => void;
  onTitleChange: (val: string) => void;
  onCopyAll: () => void;
  onDelete: () => void;
  onToggleOptions: () => void;
}
export default function EditorHeader({
  title,
  placeholder,
  viewing,
  copied,
  optionsOpen,
  onBack,
  onFinishEdit,
  onStartEdit,
  onTitleChange,
  onCopyAll,
  onDelete,
  onToggleOptions,
}: EditorHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-1.5 border-b border-slate-200 bg-white/95 px-2 pt-[env(safe-area-inset-top)] pb-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
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
            {placeholder}
          </div>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100/90 px-3.5 py-1.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
          />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
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
          onClick={onCopyAll}
          aria-label="Копировать весь текст"
          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {copied ? <Check size={19} className="text-teal-600" /> : <Copy size={19} />}
        </button>
        <button
          onClick={onDelete}
          aria-label="Удалить заметку"
          className="rounded-full p-2 text-red-500 transition hover:bg-red-50 active:scale-95 dark:hover:bg-red-950"
        >
          <Trash2 size={19} />
        </button>
        <button
          onClick={onToggleOptions}
          aria-label="Опции"
          className={`rounded-full p-2 transition active:scale-95 ${
            optionsOpen
              ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
}
