import { Bell, FileDown, Lock, Mic, ScanText, Send } from 'lucide-react';
export type EditorOptionAction = 'lock' | 'remind' | 'share' | 'ocr' | 'voice' | 'pdf';
interface EditorOptionsBarProps {
  open: boolean;
  onAction: (action: EditorOptionAction) => void;
}
const OPTIONS: { id: EditorOptionAction; label: string; icon: typeof Lock }[] = [
  { id: 'lock', label: 'Блок', icon: Lock },
  { id: 'remind', label: 'Напомнить', icon: Bell },
  { id: 'share', label: 'Отправить', icon: Send },
  { id: 'ocr', label: 'С фото', icon: ScanText },
  { id: 'voice', label: 'Голос', icon: Mic },
  { id: 'pdf', label: 'PDF', icon: FileDown },
];
export default function EditorOptionsBar({ open, onAction }: EditorOptionsBarProps) {
  if (!open) return null;
  return (
    <div
      style={{ WebkitBackdropFilter: 'blur(2px)', backdropFilter: 'blur(2px)' }}
      className="absolute inset-x-3 top-2 z-20 rounded-2xl border border-slate-400/35 bg-white/15 p-1.5 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all dark:border-slate-500/35 dark:bg-slate-900/20 dark:shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-6 gap-0.5">
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onAction(id)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-slate-900 transition hover:bg-slate-900/5 active:scale-95 dark:text-white dark:hover:bg-white/10"
          >
            <Icon size={19} strokeWidth={2.1} />
            <span className="w-full truncate px-0.5 text-center text-[10px] font-semibold leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
