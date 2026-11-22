import { useState } from 'react';
import {
  ArrowDownAZ,
  Bell,
  Clock,
  FilePlus2,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  List,
  Palette,
  Rows2,
} from 'lucide-react';
import { NOTE_COLORS, type NoteColor, type SortBy, type ViewMode } from '../lib/notes';
type SheetTab = 'color' | 'sort' | 'view';
interface ViewSortSheetProps {
  open: boolean;
  colorPickerOnly?: boolean;
  selectedColor: NoteColor | 'all';
  sortBy: SortBy;
  viewMode: ViewMode;
  onClose: () => void;
  onSelectColor: (c: NoteColor | 'all') => void;
  onSelectSort: (s: SortBy) => void;
  onSelectView: (v: ViewMode) => void;
}
const SORT_ITEMS: { id: SortBy; label: string; icon: typeof Clock }[] = [
  { id: 'updated', label: 'по дате изменения', icon: Clock },
  { id: 'created', label: 'по дате создания', icon: FilePlus2 },
  { id: 'alpha', label: 'по алфавиту', icon: ArrowDownAZ },
  { id: 'color', label: 'по цвету', icon: Palette },
  { id: 'remind', label: 'по дате напоминания', icon: Bell },
];
const VIEW_ITEMS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: 'list', label: 'Список', icon: List },
  { id: 'details', label: 'Подробности', icon: Rows2 },
  { id: 'grid', label: 'Плитка', icon: Grid3x3 },
  { id: 'large-grid', label: 'Большая плитка', icon: LayoutGrid },
];
export default function ViewSortSheet({
  open,
  colorPickerOnly = false,
  selectedColor,
  sortBy,
  viewMode,
  onClose,
  onSelectColor,
  onSelectSort,
  onSelectView,
}: ViewSortSheetProps) {
  const [tab, setTab] = useState<SheetTab>('sort');
  if (!open) return null;
  const activeTab: SheetTab = colorPickerOnly ? 'color' : tab;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <div
        className="relative z-10 rounded-t-3xl border-t border-slate-200 bg-white pt-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        {colorPickerOnly ? (
          <div className="border-b border-slate-200 px-4 py-3 text-center text-sm font-semibold text-teal-600 dark:border-slate-700 dark:text-teal-400">
            Выберите цвет заметки
          </div>
        ) : (
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-700">
            {[
              { id: 'color' as SheetTab, label: 'Цвет', icon: Grid2x2 },
              { id: 'sort' as SheetTab, label: 'Сортировка', icon: Clock },
              { id: 'view' as SheetTab, label: 'Вид', icon: List },
            ].map(({ id, label, icon: Icon }) => {
              const isAct = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
                    isAct
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  {isAct && (
                    <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-teal-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
        <div className="p-3">
          {activeTab === 'color' && (
            <div className="grid grid-cols-2 gap-2">
              {NOTE_COLORS.map((c) => {
                const isReset = c.id === 'default';
                const isSelected = selectedColor === (isReset && !colorPickerOnly ? 'all' : c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectColor(isReset && !colorPickerOnly ? 'all' : c.id);
                      onClose();
                    }}
                    className={`relative h-12 overflow-hidden rounded-xl border transition active:scale-95 ${c.swatch} ${
                      isSelected
                        ? 'border-teal-400 ring-2 ring-teal-500'
                        : 'border-slate-300/60 dark:border-slate-600/60'
                    }`}
                  >
                    {isReset && (
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
                        <line
                          x1="0"
                          y1="40"
                          x2="100"
                          y2="0"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {activeTab === 'sort' && (
            <div className="space-y-1">
              {SORT_ITEMS.map(({ id, label, icon: Icon }) => {
                const isAct = sortBy === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelectSort(id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left text-sm font-medium transition active:scale-[0.99] ${
                      isAct
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon size={20} className={isAct ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
          {activeTab === 'view' && (
            <div className="space-y-1">
              {VIEW_ITEMS.map(({ id, label, icon: Icon }) => {
                const isAct = viewMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelectView(id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left text-sm font-medium transition active:scale-[0.99] ${
                      isAct
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon size={20} className={isAct ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
