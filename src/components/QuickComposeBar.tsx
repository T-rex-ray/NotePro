import { PenLine } from 'lucide-react';

interface QuickComposeBarProps {
  onTapExpand: () => void;
}

export default function QuickComposeBar({ onTapExpand }: QuickComposeBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 px-3 pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <button
        type="button"
        onClick={onTapExpand}
        className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 text-left shadow-[0_-6px_24px_-4px_rgba(15,23,42,0.12)] backdrop-blur transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/95"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <PenLine size={14} />
            Быстрая заметка
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Нажмите, чтобы писать
          </span>
        </div>
        <div className="h-9 rounded-xl bg-slate-100/80 px-3 py-2 text-sm text-slate-400 dark:bg-slate-900/70 dark:text-slate-500">
          Начните вводить текст…
        </div>
      </button>
    </div>
  );
}
