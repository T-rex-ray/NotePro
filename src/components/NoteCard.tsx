import { useCallback, useEffect, useRef } from 'react';
import { formatDateTime, notePreview, noteTitle, type Note } from '../lib/notes';

interface NoteCardProps {
  note: Note;
  selected: boolean;
  onOpen: (id: string) => void;
  onLongPress: (id: string) => void;
}

export default function NoteCard({ note, selected, onOpen, onLongPress }: NoteCardProps) {
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
      className={`w-full select-none rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${
        selected
          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/30 dark:border-teal-400 dark:bg-teal-950/40'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">
          {noteTitle(note)}
        </h2>
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
          {formatDateTime(note.updatedAt)}
        </span>
      </div>
      {notePreview(note) && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {notePreview(note)}
        </p>
      )}
    </button>
  );
}
