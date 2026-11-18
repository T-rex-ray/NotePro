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

  // Создаем 2 уровня истории (view -> edit) при первом касании экрана или вводе текста,
  // чтобы Chrome на Android гарантированно разрешил перехват двух нажатий "Назад"
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

  // Активируем стек истории при первом касании или нажатии клавиши
  useEffect(() => {
    const onInteract = () => armHistory();
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [armHistory]);

  // Пошаговый возврат: 1) edit -> view, 2) view -> list, 3) list -> свернуть приложение
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

      if (currentScreen === 'edit') {
        const note = notesRef.current.find((n) => n.id === id);
        const isEmpty = !note || (!note.title.trim() && !note.content.trim());

        // Если заметка пустая — удаляем черновик и сразу идем в список
        if (isEmpty) {
          goList(id);
          return;
        }

        // Шаг 1: выходим из редактирования, остается режим просмотра
        blurActive();
        applyScreen('view');
        return;
      }

      if (currentScreen === 'view') {
        // Шаг 2: из просмотра возвращаемся к списку заметок
        goList(null);
        return;
      }

      // Шаг 3: на списке (list) не перехватываем — ОС сворачивает блокнот
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyActiveId, applyScreen]);

  // Начальный запуск приложения
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    if (screenRef.current === 'edit') {
      const draft = makeNote();
      setNotes((p) => [draft, ...p]);
      applyActiveId(draft.id);
      history.replaceState({ screen: 'list' }, '');
      history.pushState({ screen: 'view', id: draft.id }, '');
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

  // Кнопка "Мои заметки" в верхней панели (быстрый выход сразу к списку)
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
