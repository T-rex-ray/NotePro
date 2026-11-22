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
        className="flex w-full flex-col justify-between rounded-3xl border border-slate-200/90 bg-white/95 p-4 text-left shadow-[0_-10px_28px_-6px_rgba(15,23,42,0.14)] backdrop-blur transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/95"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <PenLine size={15} />
            Быстрая заметка
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Нажмите, чтобы писать
          </span>
        </div>
        <div className="flex h-28 w-full flex-col justify-between rounded-2xl bg-slate-100/85 px-3.5 py-3 dark:bg-slate-900/75">
          <div className="border-b border-slate-200/80 pb-1.5 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
            Начните вводить текст…
          </div>
          <div className="h-5 border-b border-slate-200/80 dark:border-slate-800" />
          <div className="h-5 border-b border-slate-200/60 dark:border-slate-800/70" />
        </div>
      </button>
    </div>
  );
}
