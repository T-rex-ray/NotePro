import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from './components/Editor';
import NotesList from './components/NotesList';
import ConfirmDialog from './components/ConfirmDialog';
import {
  loadNotes,
  loadSettings,
  makeNote,
  noteTitle,
  saveNotes,
  saveSettings,
  type Note,
  type Settings,
} from './lib/notes';

type Screen = 'list' | 'view' | 'edit';

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [screen, setScreenState] = useState<Screen>(() =>
    loadSettings().startupMode === 'list' ? 'list' : 'edit'
  );
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // Refs mirrored synchronously so the popstate handler always sees current values
  const screenRef = useRef(screen);
  const activeIdRef = useRef(activeId);
  const notesRef = useRef(notes);
  const uiToListRef = useRef(false);
  const bootedRef = useRef(false);
  const savedTimer = useRef<number | null>(null);

  const applyScreen = useCallback((s: Screen) => {
    screenRef.current = s;
    setScreenState(s);
  }, []);

  const applyActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Empty drafts never reach the persisted list
  useEffect(() => {
    saveNotes(notes.filter((n) => n.title.trim() || n.content.trim()));
  }, [notes]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // System back button: edit → view → list. At the list the app no longer
  // intercepts anything, so the OS can minimize/close the PWA as usual.
  useEffect(() => {
    const blurActive = () => {
      (document.activeElement as HTMLElement | null)?.blur?.();
    };

    const goList = (discardId: string | null) => {
      if (discardId) setNotes((p) => p.filter((n) => n.id !== discardId));
      blurActive();
      applyActiveId(null);
      applyScreen('list');
    };

    const onPopState = () => {
      const prev = screenRef.current;
      const id = activeIdRef.current;

      if (prev === 'edit') {
        const note = notesRef.current.find((n) => n.id === id);
        const isEmpty = !note || (!note.title.trim() && !note.content.trim());
        if (uiToListRef.current || isEmpty) {
          uiToListRef.current = false;
          goList(isEmpty ? id : null);
          return;
        }
        // Step 1: save (already autosaved), drop focus, show view mode.
        blurActive();
        applyScreen('view');
        // Re-add an entry so the next back press goes to the list.
        history.pushState({ screen: 'view', id }, '');
        return;
      }

      // Step 2: view → list.
      goList(null);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyActiveId, applyScreen]);

  // Quick-start: the opening editor gets its draft and a history entry
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (screenRef.current === 'edit') {
      const draft = makeNote();
      setNotes((p) => [draft, ...p]);
      applyActiveId(draft.id);
      history.pushState({ screen: 'edit', id: draft.id }, '');
    }
  }, [applyActiveId]);

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
      );
      setSavedJustNow(true);
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSavedJustNow(false), 1200);
    },
    []
  );

  // UI path back to the list: reuse history so the stack stays consistent
  const exitToList = useCallback(() => {
    uiToListRef.current = true;
    history.back();
  }, []);

  const createNote = useCallback(() => {
    const draft = makeNote();
    setNotes((p) => [draft, ...p]);
    applyActiveId(draft.id);
    applyScreen('edit');
    history.pushState({ screen: 'edit', id: draft.id }, '');
  }, [applyActiveId, applyScreen]);

  const openNote = useCallback(
    (id: string) => {
      applyActiveId(id);
      applyScreen('view');
      history.pushState({ screen: 'view', id }, '');
    },
    [applyActiveId, applyScreen]
  );

  const startEditing = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    applyScreen('edit');
    history.replaceState({ screen: 'edit', id }, '');
  }, [applyScreen]);

  const requestDelete = useCallback((id: string) => setPendingDeleteId(id), []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    setNotes((p) => p.filter((n) => n.id !== id));
    applyActiveId(null);
    applyScreen('list');
    // Consume the pushed editor/view entry so the next back exits the app
    history.back();
  }, [pendingDeleteId, applyActiveId, applyScreen]);

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const changeStartupMode = useCallback((mode: 'quick' | 'list') => {
    setSettings((s) => ({ ...s, startupMode: mode }));
  }, []);

  const pendingDeleteNote = notes.find((n) => n.id === pendingDeleteId) ?? null;
  const activeNote = notes.find((n) => n.id === activeId) ?? null;

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans">
      {(screen === 'edit' || screen === 'view') && activeNote && (
        <Editor
          note={activeNote}
          notesCount={notes.length}
          dark={settings.theme === 'dark'}
          savedJustNow={savedJustNow}
          viewing={screen === 'view'}
          onBack={exitToList}
          onOpenList={exitToList}
          onStartEdit={startEditing}
          onChange={(patch) => updateNote(activeNote.id, patch)}
          onDelete={requestDelete}
          onToggleTheme={toggleTheme}
        />
      )}

      {(screen === 'edit' || screen === 'view') && !activeNote && (
        <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-900">
          Открываю заметку…
        </div>
      )}

      {screen === 'list' && (
        <NotesList
          notes={notes}
          dark={settings.theme === 'dark'}
          startupMode={settings.startupMode}
          onOpen={openNote}
          onCreate={createNote}
          onToggleTheme={toggleTheme}
          onChangeStartupMode={changeStartupMode}
        />
      )}

      <ConfirmDialog
        open={!!pendingDeleteNote}
        title="Удалить заметку?"
        message={
          pendingDeleteNote
            ? `«${noteTitle(pendingDeleteNote)}» будет удалена безвозвратно.`
            : ''
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
