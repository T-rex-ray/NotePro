import { useState } from 'react';
import { Plus } from 'lucide-react';
interface ModeSwitchButtonProps {
  isQuick: boolean;
  onToggle: () => void;
}
export default function ModeSwitchButton({ isQuick, onToggle }: ModeSwitchButtonProps) {
  const [spin, setSpin] = useState(0);
  const handleClick = () => {
    setSpin((c) => c + 1);
    onToggle();
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Переключить режим"
      title={isQuick ? 'Режим: Быстрая панель' : 'Режим: Стандартный (+)'}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90 ${
        isQuick
          ? 'border-teal-200 bg-teal-50/90 text-teal-600 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-400'
          : 'border-slate-200 bg-slate-100/90 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 transition-transform duration-300"
        style={{ transform: `rotate(${spin * 180}deg)` }}
        fill="none"
      >
        <path
          d="M6.5 13.5A10 10 0 0 1 23.5 8.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M21.2 5.8L24.2 8.7L20.4 10.2"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.5 18.5A10 10 0 0 1 8.5 23.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M10.8 26.2L7.8 23.3L11.6 21.8"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {isQuick ? (
          <span className="flex flex-col gap-[2px]">
            <span className="h-[1.8px] w-2.5 rounded-full bg-current" />
            <span className="h-[1.8px] w-2 rounded-full bg-current" />
          </span>
        ) : (
          <Plus size={12} strokeWidth={2.8} />
        )}
      </span>
    </button>
  );
}
