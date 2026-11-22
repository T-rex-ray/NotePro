import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor from './components/Editor';
import NotesList from './components/NotesList';
import {
  loadNotes,
  loadSettings,
  makeNote,
  saveNotes,
  saveSettings,
  type Note,
  type NoteColor,
  type Settings,
  type SortBy,
  type ViewMode,
} from './lib/notes';
type Screen = 'list' | 'view' | 'edit';
export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [screen, setScreenState] = useState<Screen>('list');
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const screenRef = useRef(screen);
  const activeIdRef = useRef(activeId);
  const notesRef = useRef(notes);
  const bootedRef = useRef(false);
  const historyArmedRef = useRef(false);
  const savedTimer = useRef<number | null>(null);
  const applyScreen = useCallback((s: Screen) => {
    screenRef.current = s;
    setScreenState(s);
  }, []);
  const applyActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
  }, []);
  const armHistory = useCallback(() => {
    if (historyArmedRef.current) return;
    const current = screenRef.current;
    const id = activeIdRef.current;
    if (current === 'edit') {
      historyArmedRef.current = true;
      history.replaceState({ screen: 'list' }, '');
      history.pushState({ screen: 'view', id }, '');
      history.pushState({ screen: 'edit', id }, '');
    } else if (current === 'view') {
      historyArmedRef.current = true;
      history.replaceState({ screen: 'list' }, '');
      history.pushState({ screen: 'view', id }, '');
    }
  }, []);
  useEffect(() => {
    notesRef.current = notes;
    saveNotes(notes.filter((n) => n.title.trim() || n.content.trim()));
  }, [notes]);
  useEffect(() => {
    saveSettings(settings);
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings]);
  useEffect(() => {
    const onInteract = () => armHistory();
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('touchstart', onInteract, { passive: true });
    window.addEventListener('focusin', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('focusin', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [armHistory]);
  useEffect(() => {
    const blur = () => (document.activeElement as HTMLElement | null)?.blur?.();
    const goList = (discardId: string | null) => {
      if (discardId) setNotes((p) => p.filter((n) => n.id !== discardId));
      blur();
      applyActiveId(null);
      applyScreen('list');
      historyArmedRef.current = false;
      history.replaceState({ screen: 'list' }, '');
    };
    const onPopState = () => {
      const cur = screenRef.current;
      const id = activeIdRef.current;
      if (cur === 'edit') {
        const note = notesRef.current.find((n) => n.id === id);
        if (!note || (!note.title.trim() && !note.content.trim())) return goList(id);
        blur();
        applyScreen('view');
      } else if (cur === 'view') {
        goList(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyActiveId, applyScreen]);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    history.replaceState({ screen: 'list' }, '');
  }, []);
  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      armHistory();
      setNotes((p) => p.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
      setSavedJustNow(true);
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSavedJustNow(false), 1200);
    },
    [armHistory]
  );
  const setNoteColor = useCallback((id: string, color: NoteColor) => {
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, color } : n)));
  }, []);
  const exitToList = useCallback(() => {
    const id = activeIdRef.current;
    const note = notesRef.current.find((n) => n.id === id);
    if ((!note || (!note.title.trim() && !note.content.trim())) && id) {
      setNotes((p) => p.filter((n) => n.id !== id));
    }
    (document.activeElement as HTMLElement | null)?.blur?.();
    applyActiveId(null);
    applyScreen('list');
    historyArmedRef.current = false;
    history.replaceState({ screen: 'list' }, '');
  }, [applyActiveId, applyScreen]);
  const finishEditing = useCallback(() => {
    const id = activeIdRef.current;
    const note = notesRef.current.find((n) => n.id === id);
    if (!note || (!note.title.trim() && !note.content.trim())) return exitToList();
    (document.activeElement as HTMLElement | null)?.blur?.();
    applyScreen('view');
    history.replaceState({ screen: 'view', id }, '');
  }, [applyScreen, exitToList]);
  const createNote = useCallback(() => {
    const draft = makeNote();
    setNotes((p) => [draft, ...p]);
    applyActiveId(draft.id);
    applyScreen('edit');
    historyArmedRef.current = true;
    history.pushState({ screen: 'view', id: draft.id }, '');
    history.pushState({ screen: 'edit', id: draft.id }, '');
  }, [applyActiveId, applyScreen]);
  const openNote = useCallback(
    (id: string) => {
      applyActiveId(id);
      applyScreen('view');
      historyArmedRef.current = true;
      history.pushState({ screen: 'view', id }, '');
    },
    [applyActiveId, applyScreen]
  );
  const startEditing = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    applyScreen('edit');
    historyArmedRef.current = true;
    history.pushState({ screen: 'edit', id }, '');
  }, [applyScreen]);
  const moveToTrash = useCallback(
    (id: string) => {
      const t = notesRef.current.find((n) => n.id === id);
      if (!t || (!t.title.trim() && !t.content.trim())) {
        setNotes((p) => p.filter((n) => n.id !== id));
      } else {
        setNotes((p) => p.map((n) => (n.id === id ? { ...n, deletedAt: Date.now() } : n)));
      }
      if (activeIdRef.current === id) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        applyActiveId(null);
        applyScreen('list');
        historyArmedRef.current = false;
        history.replaceState({ screen: 'list' }, '');
      }
    },
    [applyActiveId, applyScreen]
  );
  const restoreNote = useCallback((id: string) => {
    setNotes((p) =>
      p.map((n) => (n.id === id ? { ...n, deletedAt: undefined, updatedAt: Date.now() } : n))
    );
  }, []);
  const deleteForever = useCallback((id: string) => setNotes((p) => p.filter((n) => n.id !== id)), []);
  const emptyTrash = useCallback(() => setNotes((p) => p.filter((n) => !n.deletedAt)), []);
  const toggleTheme = useCallback(
    () => setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })),
    []
  );
  const changeStartupMode = useCallback((mode: 'quick' | 'list') => {
    setSettings((s) => ({ ...s, startupMode: mode }));
  }, []);
  const changeSortBy = useCallback((sortBy: SortBy) => setSettings((s) => ({ ...s, sortBy })), []);
  const changeViewMode = useCallback((viewMode: ViewMode) => setSettings((s) => ({ ...s, viewMode })), []);
  const activeNotes = useMemo(() => notes.filter((n) => !n.deletedAt), [notes]);
  const trashedNotes = useMemo(
    () => notes.filter((n) => !!n.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [notes]
  );
  const activeNote = activeNotes.find((n) => n.id === activeId) ?? null;
  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans">
      {(screen === 'edit' || screen === 'view') && activeNote && (
        <Editor
          note={activeNote}
          notesCount={activeNotes.filter((n) => n.title.trim() || n.content.trim()).length}
          dark={settings.theme === 'dark'}
          savedJustNow={savedJustNow}
          viewing={screen === 'view'}
          onBack={exitToList}
          onFinishEdit={finishEditing}
          onOpenList={exitToList}
          onStartEdit={startEditing}
          onChange={(patch) => updateNote(activeNote.id, patch)}
          onDelete={moveToTrash}
          onToggleTheme={toggleTheme}
        />
      )}
      {screen === 'list' && (
        <NotesList
          notes={activeNotes}
          trashedNotes={trashedNotes}
          dark={settings.theme === 'dark'}
          startupMode={settings.startupMode}
          sortBy={settings.sortBy}
          viewMode={settings.viewMode}
          onOpen={openNote}
          onCreate={createNote}
          onToggleTheme={toggleTheme}
          onChangeStartupMode={changeStartupMode}
          onChangeSortBy={changeSortBy}
          onChangeViewMode={changeViewMode}
          onSetNoteColor={setNoteColor}
          onMoveToTrash={moveToTrash}
          onRestoreNote={restoreNote}
          onDeleteForever={deleteForever}
          onEmptyTrash={emptyTrash}
        />
      )}
    </div>
  );
}
