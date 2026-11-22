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
    <div className="absolute inset-x-3 top-2 z-20 rounded-2xl border border-slate-300/60 bg-slate-100/45 p-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-lg transition-all dark:border-slate-600/50 dark:bg-slate-800/45 dark:shadow-black/40">
      <div className="grid grid-cols-6 gap-0.5">
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onAction(id)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-slate-800 transition hover:bg-slate-900/5 active:scale-95 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <Icon size={19} strokeWidth={1.9} />
            <span className="w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
