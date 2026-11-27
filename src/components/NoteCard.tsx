import { useCallback, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import {
  formatDateTime,
  NOTE_COLORS,
  notePreview,
  noteTitle,
  type Note,
  type ViewMode,
} from '../lib/notes';
interface NoteCardProps {
  note: Note;
  selected: boolean;
  multiSelectMode?: boolean;
  viewMode?: ViewMode;
  onOpen: (id: string) => void;
  onLongPress: (id: string) => void;
}
export default function NoteCard({
  note,
  selected,
  multiSelectMode = false,
  viewMode = 'details',
  onOpen,
  onLongPress,
}: NoteCardProps) {
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressedRef = useRef(false);
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => () => clearTimer(), [clearTimer]);
  const handleStart = (x: number, y: number) => {
    if (multiSelectMode) return;
    longPressedRef.current = false;
    clearTimer();
    startPosRef.current = { x, y };
    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onLongPress(note.id);
      if (navigator.vibrate) navigator.vibrate(25);
    }, 450);
  };
  const handleMove = (x: number, y: number) => {
    if (!startPosRef.current || timerRef.current === null) return;
    if (Math.abs(x - startPosRef.current.x) > 10 || Math.abs(y - startPosRef.current.y) > 10) {
      clearTimer();
    }
  };
  const handleClick = () => {
    clearTimer();
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onOpen(note.id);
  };
  const colorObj = NOTE_COLORS.find((c) => c.id === (note.color ?? 'default')) ?? NOTE_COLORS;
  const isTile = viewMode === 'grid' || viewMode === 'large-grid';
  const isCompact = viewMode === 'list';
  return (
    <button
      onTouchStart={(e) => {
        const t = e.touches.item(0);
        if (t) handleStart(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        const t = e.touches.item(0);
        if (t) handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={clearTimer}
      onTouchCancel={clearTimer}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseUp={clearTimer}
      onMouseLeave={clearTimer}
      onContextMenu={(e) => e.preventDefault()}
      onClick={handleClick}
      className={`relative w-full select-none overflow-hidden rounded-2xl border text-left shadow-sm transition active:scale-[0.99] ${
        isTile ? (viewMode === 'large-grid' ? 'flex h-40 flex-col p-3.5 pl-4' : 'flex h-28 flex-col p-2.5 pl-3.5') : isCompact ? 'py-3 pl-4 pr-3.5' : 'p-3.5 pl-4.5'
      } ${
        selected
          ? 'border-teal-500 bg-teal-50/85 ring-2 ring-teal-500/35 dark:border-teal-400 dark:bg-teal-950/50'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600'
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${colorObj.stripe}`} />
      {multiSelectMode && (
        <span
          className={`absolute right-3 bottom-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
            selected
              ? 'border-teal-600 bg-teal-600 text-white'
              : 'border-slate-300 bg-white/80 dark:border-slate-600 dark:bg-slate-900/80'
          }`}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      )}
      {isTile ? (
        <>
          <h2 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {noteTitle(note)}
          </h2>
          <p className={`mt-1 flex-1 text-xs text-slate-500 dark:text-slate-400 ${viewMode === 'large-grid' ? 'line-clamp-4' : 'line-clamp-2'}`}>
            {notePreview(note) || 'Пусто'}
          </p>
          <span className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            {formatDateTime(note.updatedAt)}
          </span>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">
              {noteTitle(note)}
            </h2>
            <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
              {formatDateTime(note.updatedAt)}
            </span>
          </div>
          {!isCompact && notePreview(note) && (
            <p className="mt-1 line-clamp-2 pr-6 text-sm text-slate-500 dark:text-slate-400">
              {notePreview(note)}
            </p>
          )}
        </>
      )}
    </button>
  );
}
