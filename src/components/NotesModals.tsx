import { type Note, type NoteColor, type SortBy, type ViewMode } from '../lib/notes';
import NoteContextMenu, { type ContextAction } from './NoteContextMenu';
import SettingsModal from './SettingsModal';
import ViewSortSheet from './ViewSortSheet';
interface NotesModalsProps {
  activeMenuNote: Note | null;
  colorEditNote: Note | null;
  sheetOpen: boolean;
  settingsOpen: boolean;
  trashedNotes: Note[];
  startupMode: 'quick' | 'list';
  colorFilter: NoteColor | 'all';
  sortBy: SortBy;
  viewMode: ViewMode;
  toast: string;
  onCloseMenu: () => void;
  onMenuAction: (a: ContextAction, n: Note) => void;
  onCloseSheet: () => void;
  onSelectColorFilter: (c: NoteColor | 'all') => void;
  onChangeSortBy: (s: SortBy) => void;
  onChangeViewMode: (v: ViewMode) => void;
  onCloseColorEdit: () => void;
  onApplyNoteColor: (c: NoteColor) => void;
  onCloseSettings: () => void;
  onChangeStartupMode: (m: 'quick' | 'list') => void;
  onRestoreNote: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onEmptyTrash: () => void;
}
export default function NotesModals(p: NotesModalsProps) {
  return (
    <>
      <NoteContextMenu note={p.activeMenuNote} onClose={p.onCloseMenu} onAction={p.onMenuAction} />
      <ViewSortSheet
        open={p.sheetOpen}
        selectedColor={p.colorFilter}
        sortBy={p.sortBy}
        viewMode={p.viewMode}
        onClose={p.onCloseSheet}
        onSelectColor={p.onSelectColorFilter}
        onSelectSort={p.onChangeSortBy}
        onSelectView={p.onChangeViewMode}
      />
      <ViewSortSheet
        open={!!p.colorEditNote}
        colorPickerOnly
        selectedColor={p.colorEditNote?.color ?? 'default'}
        sortBy={p.sortBy}
        viewMode={p.viewMode}
        onClose={p.onCloseColorEdit}
        onSelectColor={(c) => { if (c !== 'all') p.onApplyNoteColor(c); }}
        onSelectSort={p.onChangeSortBy}
        onSelectView={p.onChangeViewMode}
      />
      <SettingsModal
        open={p.settingsOpen}
        trashedNotes={p.trashedNotes}
        startupMode={p.startupMode}
        onClose={p.onCloseSettings}
        onChangeStartupMode={p.onChangeStartupMode}
        onRestoreNote={p.onRestoreNote}
        onDeleteForever={p.onDeleteForever}
        onEmptyTrash={p.onEmptyTrash}
      />
      <div className={`pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-6 transition-opacity ${p.toast ? 'opacity-100' : 'opacity-0'}`}>
        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">{p.toast}</span>
      </div>
    </>
  );
}
