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
  selectedCount?: number;
  allSelected?: boolean;
  onClose: () => void;
  onAction: (action: ContextAction, note: Note) => void;
}
const TOP_ACTIONS: { id: ContextAction; label: string; icon: typeof Pin }[] = [
  { id: 'select', label: 'Выбрать все', icon: CheckSquare },
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
const MULTI_ALLOWED: ContextAction[] = ['select', 'archive', 'delete', 'color'];
export default function NoteContextMenu({
  note,
  selectedCount = 1,
  allSelected = false,
  onClose,
  onAction,
}: NoteContextMenuProps) {
  if (!note) return null;
  const isMulti = selectedCount > 1;
  const headerText = isMulti ? `Выбрано: ${selectedCount}` : noteTitle(note);
  const renderBtn = ({ id, label, icon: Icon, danger }: { id: ContextAction; label: string; icon: typeof Pin; danger?: boolean }) => {
    const disabled = isMulti && !MULTI_ALLOWED.includes(id);
    const displayLabel = id === 'select' && allSelected ? 'Снять все' : label;
    return (
      <button
        key={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onAction(id, note)}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 transition ${
          disabled
            ? 'pointer-events-none opacity-30 text-slate-400 dark:text-slate-500'
            : danger
            ? 'text-red-600 hover:bg-red-50 active:scale-95 dark:text-red-400 dark:hover:bg-red-950/50'
            : 'text-slate-700 hover:bg-slate-200/80 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-700/80'
        }`}
      >
        <Icon size={22} strokeWidth={1.8} />
        <span className="w-full truncate px-0.5 text-center text-[11px] font-medium leading-tight">
          {displayLabel}
        </span>
      </button>
    );
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div
        className="relative z-10 rounded-t-3xl border-t border-slate-200 bg-slate-100/95 px-2 pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-700 dark:bg-slate-800/95"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="mb-2 flex items-center justify-between px-3 pb-1">
          <span className="line-clamp-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {headerText}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1">{TOP_ACTIONS.map(renderBtn)}</div>
        <div className="my-1.5 h-px bg-slate-200/80 dark:bg-slate-700/80" />
        <div className="grid grid-cols-5 gap-1">{BOTTOM_ACTIONS.map(renderBtn)}</div>
      </div>
    </div>
  );
}
