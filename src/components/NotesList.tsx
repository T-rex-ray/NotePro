import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Moon, Plus, Search, Settings, Sun, X } from 'lucide-react';
import { noteTitle, type Note } from '../lib/notes';
import BottomNavBar, { type BottomTab } from './BottomNavBar';
import NoteCard from './NoteCard';
import NoteContextMenu, { type ContextAction } from './NoteContextMenu';
import QuickComposeBar from './QuickComposeBar';
import SettingsModal from './SettingsModal';
interface NotesListProps {
  notes: Note[];
  trashedNotes: Note[];
  dark: boolean;
  startupMode: 'quick' | 'list';
  onOpen: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
  onChangeStartupMode: (mode: 'quick' | 'list') => void;
  onMoveToTrash: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onEmptyTrash: () => void;
}
export default function NotesList({
  notes,
  trashedNotes,
  dark,
  startupMode,
  onOpen,
  onCreate,
  onToggleTheme,
  onChangeStartupMode,
  onMoveToTrash,
  onRestoreNote,
  onDeleteForever,
  onEmptyTrash,
}: NotesListProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>('notes');
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [barCollapsed, setBarCollapsed] = useState(false);
  const [toast, setToast] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setBarCollapsed(startupMode === 'list');
  }, [startupMode]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  const closeSearch = () => {
    setQuery('');
    setSearchOpen(false);
    setActiveTab('notes');
  };
  const toggleMode = () => {
    const next = startupMode === 'quick' ? 'list' : 'quick';
    setBarCollapsed(next === 'list');
    onChangeStartupMode(next);
    setToast(next === 'quick' ? 'Режим: Быстрая панель' : 'Режим: Стандартный');
  };
  const collapseBar = () => {
    if (startupMode === 'quick' && !barCollapsed) {
      setBarCollapsed(true);
    }
  };
  const handleBottomTab = (tab: BottomTab) => {
    if (tab === 'notes') {
      setActiveTab('notes');
      if (searchOpen) closeSearch();
      return;
    }
    if (tab === 'search') {
      if (searchOpen) {
        closeSearch();
      } else {
        setActiveTab('search');
        setSearchOpen(true);
      }
      return;
    }
    if (tab === 'calendar') {
      setToast('Календарь заметок — добавим следующим шагом');
      return;
    }
    if (tab === 'menu') {
      setSettingsOpen(true);
    }
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);
  const handleMenuAction = async (action: ContextAction, note: Note) => {
    setMenuNoteId(null);
    if (action === 'share') {
      const text = note.title.trim() ? `${note.title.trim()}\n\n${note.content}` : note.content;
      try {
        if (navigator.share) {
          await navigator.share({ title: noteTitle(note), text });
        } else {
          await navigator.clipboard.writeText(text);
          setToast('Скопировано в буфер обмена');
        }
      } catch {
        // ignore
      }
      return;
    }
    if (action === 'delete') {
      onMoveToTrash(note.id);
      setToast('Заметка перемещена в корзину');
      return;
    }
    setToast('Функция будет добавлена следующим шагом');
  };
  const activeMenuNote = useMemo(
    () => notes.find((n) => n.id === menuNoteId) ?? null,
    [notes, menuNoteId]
  );
  const showQuickBar = startupMode === 'quick' && !barCollapsed;
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <div className="flex items-center justify-between pb-2.5">
          <h1
            className="select-none text-3xl font-bold tracking-wide text-slate-900 dark:text-white"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            MyNote<span className="text-teal-600 dark:text-teal-400">Pro</span>
          </h1>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onToggleTheme}
              aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Настройки"
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="relative pb-2.5">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск заметок…"
              className="w-full rounded-full border border-teal-500/60 bg-slate-100 py-2 pl-10 pr-10 text-sm outline-none transition focus:bg-white dark:border-teal-500/40 dark:bg-slate-800 dark:focus:bg-slate-800"
            />
            <button
              onClick={closeSearch}
              aria-label="Закрыть поиск"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </header>
      <main
        onTouchStart={collapseBar}
        onMouseDown={collapseBar}
        className={`min-h-0 flex-1 overflow-y-auto px-4 pt-3 ${showQuickBar ? 'pb-48' : 'pb-36'}`}
      >
        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center text-slate-400 dark:text-slate-500">
            <FileText size={48} strokeWidth={1.5} />
            <p className="mt-4 text-sm">
              {query ? 'Ничего не найдено' : 'Пока нет заметок.\nНажмите «+» или панель снизу, чтобы создать.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => (
              <li key={n.id}>
                <NoteCard
                  note={n}
                  selected={n.id === menuNoteId}
                  onOpen={onOpen}
                  onLongPress={setMenuNoteId}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      {showQuickBar ? (
        <QuickComposeBar onTapExpand={onCreate} />
      ) : (
        <>
          <button
            onClick={onCreate}
            aria-label="Новая заметка"
            className="fixed bottom-24 right-5 z-20 flex h-13 w-13 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 active:scale-90"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <Plus size={25} />
          </button>
          <BottomNavBar
            activeTab={activeTab}
            isQuick={startupMode === 'quick'}
            onSelectTab={handleBottomTab}
            onToggleMode={toggleMode}
          />
        </>
      )}
      <NoteContextMenu
        note={activeMenuNote}
        onClose={() => setMenuNoteId(null)}
        onAction={handleMenuAction}
      />
      <SettingsModal
        open={settingsOpen}
        trashedNotes={trashedNotes}
        startupMode={startupMode}
        onClose={() => setSettingsOpen(false)}
        onChangeStartupMode={onChangeStartupMode}
        onRestoreNote={onRestoreNote}
        onDeleteForever={onDeleteForever}
        onEmptyTrash={onEmptyTrash}
      />
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-6 transition-opacity ${
          toast ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">{toast}</span>
      </div>
    </div>
  );
}
