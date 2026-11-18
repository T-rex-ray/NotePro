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

  // Регистрируем шаг истории при первом реальном взаимодействии с экраном,
  // чтобы Chrome на Android не блокировал перехват кнопки "Назад"
  const armHistory = useCallback(() => {
    if (historyArmedRef.current) return;
    if (screenRef.current !== 'list') {
      historyArmedRef.current = true;
      history.replaceState({ screen: 'list' }, '');
      history.pushState({ screen: screenRef.current, id: activeIdRef.current }, '');
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

  // Слушаем первое касание или нажатие клавиши, чтобы активировать историю для кнопки "Назад"
  useEffect(() => {
    const onInteract = () => armHistory();
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [armHistory]);

  // Обработка системной стрелочки "Назад": из редактирования/просмотра -> сразу в список заметок
  useEffect(() => {
    const blurActive = () => {
      (document.activeElement as HTMLElement | null)?.blur?.();
    };

    const goList = (discardId: string | null) => {
      if (discardId) {
        setNotes((p) => p.filter((n) => n.id !== discardId));
      }
      blurActive();
      applyActiveId(null);
      applyScreen('list');
      historyArmedRef.current = false;
    };

    const onPopState = () => {
      const currentScreen = screenRef.current;
      const id = activeIdRef.current;

      if (currentScreen === 'edit' || currentScreen === 'view') {
        const note = notesRef.current.find((n) => n.id === id);
        const isEmpty = !note || (!note.title.trim() && !note.content.trim());
        goList(isEmpty ? id : null);
        return;
      }
      // На экране списка (list) больше не перехватываем — следующее нажатие свернет блокнот
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyActiveId, applyScreen]);

  // Стартовая инициализация
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    if (screenRef.current === 'edit') {
      const draft = makeNote();
      setNotes((p) => [draft, ...p]);
      applyActiveId(draft.id);
      history.replaceState({ screen: 'list' }, '');
      history.pushState({ screen: 'edit', id: draft.id }, '');
    } else {
      history.replaceState({ screen: 'list' }, '');
    }
  }, [applyActiveId]);

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      armHistory();
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
      );
      setSavedJustNow(true);
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSavedJustNow(false), 1200);
    },
    [armHistory]
  );

  // Кнопка "Мои заметки" в верхнем меню
  const exitToList = useCallback(() => {
    const id = activeIdRef.current;
    const note = notesRef.current.find((n) => n.id === id);
    const isEmpty = !note || (!note.title.trim() && !note.content.trim());

    if (isEmpty && id) {
      setNotes((p) => p.filter((n) => n.id !== id));
    }

    (document.activeElement as HTMLElement | null)?.blur?.();
    applyActiveId(null);
    applyScreen('list');
    historyArmedRef.current = false;
    history.replaceState({ screen: 'list' }, '');
  }, [applyActiveId, applyScreen]);

  const createNote = useCallback(() => {
    const draft = makeNote();
    setNotes((p) => [draft, ...p]);
    applyActiveId(draft.id);
    applyScreen('edit');
    historyArmedRef.current = true;
    history.pushState({ screen: 'edit', id: draft.id }, '');
  }, [applyActiveId, applyScreen]);

  const openNote = useCallback(
    (id: string) => {
      applyActiveId(id);
      applyScreen('edit');
      historyArmedRef.current = true;
      history.pushState({ screen: 'edit', id }, '');
    },
    [applyActiveId, applyScreen]
  );

  const startEditing = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    applyScreen('edit');
  }, [applyScreen]);

  const requestDelete = useCallback((id: string) => setPendingDeleteId(id), []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    setNotes((p) => p.filter((n) => n.id !== id));
    applyActiveId(null);
    applyScreen('list');
    historyArmedRef.current = false;
    history.replaceState({ screen: 'list' }, '');
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
          notesCount={notes.filter((n) => n.title.trim() || n.content.trim()).length}
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
