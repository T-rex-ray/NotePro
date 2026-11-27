import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { NOTE_COLORS, noteTitle, type Note, type NoteColor, type SortBy, type ViewMode } from '../lib/notes';
import BottomNavBar, { type BottomTab } from './BottomNavBar';
import NoteCard from './NoteCard';
import { type ContextAction } from './NoteContextMenu';
import NotesHeader from './NotesHeader';
import NotesModals from './NotesModals';
import NotesWallpaper from './NotesWallpaper';
import QuickComposeBar from './QuickComposeBar';
interface NotesListProps {
  notes: Note[];
  trashedNotes: Note[];
  dark: boolean;
  startupMode: 'quick' | 'list';
  sortBy: SortBy;
  viewMode: ViewMode;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
  onChangeStartupMode: (mode: 'quick' | 'list') => void;
  onChangeSortBy: (s: SortBy) => void;
  onChangeViewMode: (v: ViewMode) => void;
  onSetNoteColor: (id: string, c: NoteColor) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onEmptyTrash: () => void;
}
export default function NotesList(p: NotesListProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>('notes');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [multiMode, setMultiMode] = useState(false);
  const [colorEditIds, setColorEditIds] = useState<string[]>([]);
  const [colorFilter, setColorFilter] = useState<NoteColor | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [barCollapsed, setBarCollapsed] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => { setBarCollapsed(p.startupMode === 'list'); }, [p.startupMode]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);
  const clearSelection = () => { setSelectedIds([]); setMultiMode(false); };
  const closeSearch = () => { setQuery(''); setSearchOpen(false); setActiveTab('notes'); };
  const toggleMode = () => {
    const next = p.startupMode === 'quick' ? 'list' : 'quick';
    setBarCollapsed(next === 'list');
    p.onChangeStartupMode(next);
    setToast(next === 'quick' ? 'Режим: Быстрая панель' : 'Режим: Стандартный');
  };
  const collapseBar = () => { if (p.startupMode === 'quick' && !barCollapsed) setBarCollapsed(true); };
  const handleTab = (tab: BottomTab) => {
    if (tab === 'notes') { setActiveTab('notes'); if (searchOpen) closeSearch(); }
    else if (tab === 'search') { if (searchOpen) closeSearch(); else { setActiveTab('search'); setSearchOpen(true); } }
    else if (tab === 'calendar') setToast('Календарь заметок — добавим следующим шагом');
    else if (tab === 'menu') setSettingsOpen(true);
  };
  const handleCardPress = (id: string) => {
    if (multiMode) {
      setSelectedIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        if (next.length === 0) setMultiMode(false);
        return next;
      });
      return;
    }
    p.onOpen(id);
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...p.notes];
    if (colorFilter !== 'all') list = list.filter((n) => (n.color ?? 'default') === colorFilter);
    if (q) list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    list.sort((a, b) => {
      if (p.sortBy === 'created') return b.createdAt - a.createdAt;
      if (p.sortBy === 'alpha') return noteTitle(a).localeCompare(noteTitle(b), 'ru');
      if (p.sortBy === 'color') {
        const oa = NOTE_COLORS.find((c) => c.id === (a.color ?? 'default'))?.order ?? 0;
        const ob = NOTE_COLORS.find((c) => c.id === (b.color ?? 'default'))?.order ?? 0;
        return oa - ob || b.updatedAt - a.updatedAt;
      }
      if (p.sortBy === 'remind') return (b.remindAt ?? 0) - (a.remindAt ?? 0);
      return b.updatedAt - a.updatedAt;
    });
    return list;
  }, [p.notes, query, colorFilter, p.sortBy]);
  const handleMenuAction = async (action: ContextAction, note: Note) => {
    const targets = selectedIds.length > 0 ? selectedIds : [note.id];
    if (action === 'select') {
      setMultiMode(true);
      if (!selectedIds.includes(note.id)) setSelectedIds([note.id]);
      setToast('Нажимайте на заметки, чтобы отметить');
      return;
    }
    if (action === 'share' && targets.length === 1) {
      clearSelection();
      const text = note.title.trim() ? `${note.title.trim()}\n\n${note.content}` : note.content;
      try {
        if (navigator.share) await navigator.share({ title: noteTitle(note), text });
        else { await navigator.clipboard.writeText(text); setToast('Скопировано в буфер обмена'); }
      } catch {}
      return;
    }
    if (action === 'delete') {
      targets.forEach((id) => p.onMoveToTrash(id));
      clearSelection();
      setToast(targets.length > 1 ? `В корзину: ${targets.length}` : 'Заметка перемещена в корзину');
      return;
    }
    if (action === 'color') {
      setColorEditIds(targets);
      clearSelection();
      return;
    }
    clearSelection();
    setToast('Функция будет добавлена следующим шагом');
  };
  const showQuickBar = p.startupMode === 'quick' && !barCollapsed;
  const gridClass = p.viewMode === 'grid' ? 'grid grid-cols-3 gap-2' : p.viewMode === 'large-grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2';
  const activeMenuNote = p.notes.find((n) => n.id === selectedIds.at(0)) ?? null;
  const firstColorNote = p.notes.find((n) => n.id === colorEditIds.at(0));
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-slate-100/80 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NotesWallpaper />
      <NotesHeader dark={p.dark} searchOpen={searchOpen} query={query} sortBy={p.sortBy} colorFilter={colorFilter} onToggleTheme={p.onToggleTheme} onOpenSettings={() => setSettingsOpen(true)} onQueryChange={setQuery} onCloseSearch={closeSearch} onOpenSheet={() => setSheetOpen(true)} />
      <main onTouchStart={collapseBar} onMouseDown={collapseBar} className={`relative z-10 min-h-0 flex-1 overflow-y-auto px-3 pt-1 ${selectedIds.length > 0 ? 'pb-56' : showQuickBar ? 'pb-48' : 'pb-40'}`}>
        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center text-slate-400 dark:text-slate-500">
            <FileText size={48} strokeWidth={1.5} />
            <p className="mt-4 text-sm">{query || colorFilter !== 'all' ? 'Ничего не найдено' : 'Пока нет заметок.\nНажмите кнопку снизу, чтобы создать.'}</p>
          </div>
        ) : (
          <ul className={gridClass}>
            {filtered.map((n) => (
              <li key={n.id}>
                <NoteCard note={n} selected={selectedIds.includes(n.id)} multiSelectMode={multiMode} viewMode={p.viewMode} onOpen={handleCardPress} onLongPress={(id) => { setMultiMode(false); setSelectedIds([id]); }} />
              </li>
            ))}
          </ul>
        )}
      </main>
      {selectedIds.length === 0 && (showQuickBar ? (
        <QuickComposeBar onTapExpand={p.onCreate} />
      ) : (
        <>
          <button onClick={p.onCreate} aria-label="Новая заметка" className="fixed bottom-24 right-4 z-20 flex h-16 items-center gap-2.5 rounded-full bg-teal-600 px-6 text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 active:scale-95" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
            <Plus size={25} strokeWidth={2.6} />
            <FileText size={23} strokeWidth={2.1} />
          </button>
          <BottomNavBar activeTab={activeTab} isQuick={p.startupMode === 'quick'} onSelectTab={handleTab} onToggleMode={toggleMode} />
        </>
      ))}
      <NotesModals activeMenuNote={activeMenuNote} selectedCount={selectedIds.length} multiSelectMode={multiMode} colorEditActive={colorEditIds.length > 0} currentEditColor={firstColorNote?.color ?? 'default'} sheetOpen={sheetOpen} settingsOpen={settingsOpen} trashedNotes={p.trashedNotes} startupMode={p.startupMode} colorFilter={colorFilter} sortBy={p.sortBy} viewMode={p.viewMode} toast={toast} onCloseMenu={clearSelection} onMenuAction={handleMenuAction} onCloseSheet={() => setSheetOpen(false)} onSelectColorFilter={setColorFilter} onChangeSortBy={p.onChangeSortBy} onChangeViewMode={p.onChangeViewMode} onCloseColorEdit={() => setColorEditIds([])} onApplyNoteColor={(c) => { colorEditIds.forEach((id) => p.onSetNoteColor(id, c)); setColorEditIds([]); setToast('Цвет обновлён'); }} onCloseSettings={() => setSettingsOpen(false)} onChangeStartupMode={p.onChangeStartupMode} onRestoreNote={p.onRestoreNote} onDeleteForever={p.onDeleteForever} onEmptyTrash={p.onEmptyTrash} />
    </div>
  );
}
