import { Calendar, FileText, Menu, Search } from 'lucide-react';
import ModeSwitchButton from './ModeSwitchButton';
export type BottomTab = 'notes' | 'calendar' | 'search' | 'menu';
interface BottomNavBarProps {
  activeTab: BottomTab;
  isQuick: boolean;
  onSelectTab: (tab: BottomTab) => void;
  onToggleMode: () => void;
}
export default function BottomNavBar({
  activeTab,
  isQuick,
  onSelectTab,
  onToggleMode,
}: BottomNavBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <nav
        style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
        className="flex w-full max-w-md items-center justify-around rounded-3xl border border-slate-300/60 bg-white/55 px-2 py-1.5 shadow-[0_8px_28px_rgba(15,23,42,0.12)] dark:border-slate-600/50 dark:bg-slate-800/55 dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
      >
        <button
          type="button"
          onClick={() => onSelectTab('notes')}
          aria-label="Заметки"
          className={`flex flex-col items-center justify-center rounded-2xl p-2.5 transition active:scale-90 ${
            activeTab === 'notes'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <FileText size={21} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('calendar')}
          aria-label="Календарь"
          className={`flex flex-col items-center justify-center rounded-2xl p-2.5 transition active:scale-90 ${
            activeTab === 'calendar'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <Calendar size={21} strokeWidth={2} />
        </button>
        <div className="px-1">
          <ModeSwitchButton isQuick={isQuick} onToggle={onToggleMode} />
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('search')}
          aria-label="Поиск"
          className={`flex flex-col items-center justify-center rounded-2xl p-2.5 transition active:scale-90 ${
            activeTab === 'search'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <Search size={21} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          aria-label="Меню"
          className="flex flex-col items-center justify-center rounded-2xl p-2.5 text-slate-600 transition hover:text-slate-900 active:scale-90 dark:text-slate-300 dark:hover:text-white"
        >
          <Menu size={21} strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
}
