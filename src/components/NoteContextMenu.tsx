import {
  Archive,
  Bell,
  CheckSquare,
  CopyPlus,
  FileDown,
  Lock,
  Palette,
  Pin,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { noteTitle, type Note } from '../lib/notes';

export type ContextAction =
  | 'select'
  | 'duplicate'
  | 'pin'
  | 'share'
  | 'lock'
  | 'archive'
  | 'delete'
  | 'color'
  | 'remind'
  | 'pdf';

interface NoteContextMenuProps {
  note: Note | null;
  onClose: () => void;
  onAction: (action: ContextAction, note: Note) => void;
}

const TOP_ACTIONS: { id: ContextAction; label: string; icon: typeof Pin }[] = [
  { id: 'select', label: 'Отметить', icon: CheckSquare },
  { id: 'duplicate', label: 'Дублировать', icon: CopyPlus },
  { id: 'pin', label: 'Закрепить', icon: Pin },
  { id: 'share', label: 'Отправить', icon: Send },
  { id: 'lock', label: 'Блок', icon: Lock },
];

const BOTTOM_ACTIONS: { id: ContextAction; label: string; icon: typeof Archive; danger?: boolean }[] = [
  { id: 'archive', label: 'Архив', icon: Archive },
  { id: 'delete', label: 'Удалить', icon: Trash2, danger: true },
  { id: 'color', label: 'Цвет', icon: Palette },
  { id: 'remind', label: 'Напомнить', icon: Bell },
  { id: 'pdf', label: 'PDF', icon: FileDown },
];

export default function NoteContextMenu({ note, onClose, onAction }: NoteContextMenuProps) {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Полупрозрачный фон для закрытия по тапу мимо панели */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
      />

      {/* Выезжающая снизу двухрядная панель */}
      <div
        className="relative z-10 rounded-t-3xl border-t border-slate-200 bg-slate-100/95 px-2 pt-3 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        {/* Шапка панели с названием выбранной заметки */}
        <div className="mb-2 flex items-center justify-between px-3 pb-1">
          <span className="line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {noteTitle(note)}
          </span>
          <button
            onClick={onClose}
            aria-label="Закрыть меню"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Верхний ряд (5 кнопок) */}
        <div className="grid grid-cols-5 gap-1">
          {TOP_ACTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onAction(id, note)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 text-slate-700 transition hover:bg-slate-200/80 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-700/80"
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="w-full truncate px-0.5 text-center text-[11px] font-medium leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Тонкий разделитель между рядами */}
        <div className="my-1.5 h-px bg-slate-200/80 dark:bg-slate-700/80" />

        {/* Нижний ряд (5 кнопок, справа PDF вместо "Ещё") */}
        <div className="grid grid-cols-5 gap-1">
          {BOTTOM_ACTIONS.map(({ id, label, icon: Icon, danger }) => (
            <button
              key={id}
              onClick={() => onAction(id, note)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 transition active:scale-95 ${
                danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                  : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-700/80'
              }`}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="w-full truncate px-0.5 text-center text-[11px] font-medium leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
