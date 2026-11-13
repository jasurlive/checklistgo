import { useRef, useState } from "react";
import { FiDownload, FiMaximize, FiMinimize, FiTrash2, FiUpload } from "react-icons/fi";
import Header from "../components/Header";
import { useTheme } from "../hooks/LOCAL/useTheme";
import { useFullscreen } from "../hooks/LOCAL/useFullscreen";
import { newId } from "../hooks/LOCAL/useSheets";
import { FREQ_KEY, SHOP_KEY } from "../hooks/LOCAL/useShopping";
import { HABITS_KEY, normalizeHabits } from "../hooks/LOCAL/useHabits";
import { NOTES_KEY, normalizeNotes } from "../hooks/LOCAL/useNotes";
import { load, save } from "../lib/storage";
import { THEME_LABELS } from "../lib/themes";
import type { Habit, Note, ShopItem, Sheet } from "../lib/types";
import { THEME_ICONS } from "../shared/ThemeIcons";

// keep in sync with the useShortcuts calls in Menu.tsx and the pages
const SHORTCUTS = [
  { keys: ["N"], action: "Focus the input (Notes: new note)" },
  { keys: ["Enter"], action: "Add / save item" },
  { keys: ["Esc"], action: "Cancel editing / close a note" },
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], action: "Redo (or Ctrl+Y)" },
  { keys: ["Shift", "N"], action: "New sheet" },
  { keys: ["["], action: "Previous sheet" },
  { keys: ["]"], action: "Next sheet" },
  { keys: ["Ctrl", "J"], action: "Switch to the next theme" },
  { keys: ["`"], action: "Collapse or expand the sidebar" },
];

const TIPS = [
  "Tap an item to tick it off. Drag the handle to reorder.",
  "Sheets are separate checklists: groceries, work, packing… Add one with +, double-click a tab to rename it.",
  "Undo works for everything, including deleted sheets.",
  "Shopping: type \"2 milk\" or \"eggs x12\" to set the amount. Ticked items move to In cart; often-added ones show up under Buy again.",
  "Habits untick themselves every day. Tap a dot in the 7-day row to fix a day you forgot.",
  "Notes: the first line is the title. Empty notes are removed when you leave them.",
  "Everything is saved in this browser and works offline. Nothing is sent to a server.",
  "Export a backup below to move everything (sheets, shopping, habits, notes) to another device or browser.",
  "On phones the menu is a bar at the bottom.",
];

const YEAR = new Date().getFullYear();

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const isBackup = (v: unknown): v is { sheets: Sheet[]; shopping?: unknown; habits?: unknown; notes?: unknown } =>
  !!v &&
  Array.isArray((v as { sheets?: unknown }).sheets) &&
  (v as { sheets: unknown[] }).sheets.every(
    (s) => !!s && typeof (s as Sheet).name === "string" && Array.isArray((s as Sheet).items),
  );

// backups may come from older versions or be hand-edited: fill in missing ids, drop junk items
const normalize = (sheets: Sheet[]): Sheet[] =>
  sheets.map((s) => ({
    id: typeof s.id === "string" ? s.id : newId(),
    name: s.name.trim() || "Untitled",
    items: s.items
      .filter((i) => !!i && typeof i.text === "string")
      .map((i) => ({ id: typeof i.id === "string" ? i.id : newId(), text: i.text, completed: !!i.completed })),
  }));

export default function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const { fullscreen, toggleFullscreen, supported } = useFullscreen();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState(() => load<Sheet[]>("sheets", []));
  const [shopping, setShopping] = useState(() => load<ShopItem[]>(SHOP_KEY, []));
  const [habits, setHabits] = useState(() => normalizeHabits(load<unknown>(HABITS_KEY, [])));
  const [notes, setNotes] = useState(() => normalizeNotes(load<unknown>(NOTES_KEY, [])));
  const [message, setMessage] = useState("");

  const items = sheets.reduce((n, s) => n + s.items.length, 0) + shopping.length;

  const exportBackup = () => {
    const data = JSON.stringify({ app: "checklistgo", version: 3, sheets, shopping, habits, notes }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklistgo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isBackup(data)) throw new Error("bad file");
      if (!confirm(`Replace your ${sheets.length} sheet(s) with ${data.sheets.length} from the file?`)) return;
      const imported = normalize(data.sheets);
      save("sheets", imported);
      setSheets(imported);
      // older backups have no shopping list: keep the current one then
      if (Array.isArray(data.shopping)) {
        const list = (data.shopping as ShopItem[])
          .filter((i) => !!i && typeof i.name === "string")
          .map((i) => ({ id: typeof i.id === "string" ? i.id : newId(), name: i.name, qty: Math.max(1, Number(i.qty) || 1), bought: !!i.bought }));
        save(SHOP_KEY, list);
        setShopping(list);
      }
      if (Array.isArray(data.habits)) {
        const list: Habit[] = normalizeHabits(data.habits);
        save(HABITS_KEY, list);
        setHabits(list);
      }
      if (Array.isArray(data.notes)) {
        const list: Note[] = normalizeNotes(data.notes);
        save(NOTES_KEY, list);
        setNotes(list);
      }
      setMessage(`Imported ${data.sheets.length} sheet(s).`);
    } catch {
      setMessage("That file isn't a ChecklistGo backup.");
    }
  };

  const resetAll = () => {
    if (!confirm("Delete all sheets, the shopping list, habits and notes? This can't be undone.")) return;
    save("sheets", []);
    save("items", []);
    save(SHOP_KEY, []);
    save(FREQ_KEY, {});
    save(HABITS_KEY, []);
    save(NOTES_KEY, []);
    setHabits([]);
    setNotes([]);
    setSheets([]);
    setShopping([]);
    setMessage("Everything was deleted.");
  };

  return (
    <div className="page-container">
      <Header title="Settings" subtitle="Theme, data, shortcuts and info" />

      <h2 className="page-subtitle">Theme</h2>
      <div className="theme-picker" role="radiogroup" aria-label="Theme">
        {themes.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={t === theme}
            className={`page-button theme-option ${t === theme ? "is-active" : ""}`}
            onClick={() => setTheme(t)}
          >
            {THEME_ICONS[t]}
            {THEME_LABELS[t]}
          </button>
        ))}
      </div>
      <p className="page-text">Tip: Ctrl+J cycles through themes.</p>

      <h2 className="page-subtitle">Display</h2>
      {supported ? (
        <button
          type="button"
          aria-pressed={fullscreen}
          className={`page-button theme-option ${fullscreen ? "is-active" : ""}`}
          onClick={toggleFullscreen}
        >
          {fullscreen ? <FiMinimize /> : <FiMaximize />}
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      ) : (
        <p className="page-text">Fullscreen isn't supported in this browser.</p>
      )}

      <h2 className="page-subtitle">Data</h2>
      <p className="page-text">
        {plural(sheets.length, "sheet")}, {plural(items, "item")}, {plural(habits.length, "habit")},{" "}
        {plural(notes.length, "note")} saved in this browser.
      </p>
      <div className="theme-picker settings-data">
        <button type="button" className="page-button theme-option" onClick={exportBackup}>
          <FiDownload /> Export backup
        </button>
        <button type="button" className="page-button theme-option" onClick={() => fileRef.current?.click()}>
          <FiUpload /> Import backup
        </button>
        <button type="button" className="page-button theme-option settings-danger" onClick={resetAll}>
          <FiTrash2 /> Delete everything
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importBackup(file);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p className="page-text" role="status">
          {message}
        </p>
      )}

      <h2 className="page-subtitle">Keyboard shortcuts</h2>
      <ul className="info-list">
        {SHORTCUTS.map((s) => (
          <li key={s.action}>
            <span>
              {s.keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>
            {s.action}
          </li>
        ))}
      </ul>
      <p className="page-text">On Mac, use ⌘ instead of Ctrl. Shortcuts are ignored while typing in a field.</p>

      <h2 className="page-subtitle">Using the app</h2>
      <ul className="info-list info-tips">
        {TIPS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      <p className="page-text info-footer">
        ChecklistGo v{__APP_VERSION__} · © 2019–{YEAR} Jasur ·{" "}
        <a href="https://jasurlive.uz" target="_blank" rel="noreferrer">
          jasurlive.uz
        </a>{" "}
        · Feedback:{" "}
        <a href="https://t.me/jasurlive_bot" target="_blank" rel="noreferrer">
          @jasurlive_bot
        </a>
      </p>
    </div>
  );
}
