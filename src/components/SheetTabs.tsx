import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import "../css/sheets.css";
import type { Sheet } from "../lib/types";

// row of sheet tabs above the list + actions for the active one
export default function SheetTabs({
  sheets,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onRemove,
}: {
  sheets: Sheet[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const activeRef = useRef<HTMLButtonElement>(null);
  const active = sheets.find((s) => s.id === activeId);

  // keep the active tab in view when switching with [ / ] or adding a sheet
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);

  const startRename = () => {
    if (!active) return;
    setRenaming(active.id);
    setName(active.name);
  };

  const finishRename = () => {
    const value = name.trim();
    if (renaming && value) onRename(renaming, value);
    setRenaming(null);
  };

  const remove = () => {
    if (!active) return;
    if (
      active.items.length &&
      !confirm(`Delete "${active.name}" and its ${active.items.length} item(s)? You can undo this.`)
    )
      return;
    onRemove(active.id);
  };

  return (
    <div className="sheets">
      <div className="sheets-tabs" role="tablist" aria-label="Sheets">
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeId;
          const done = sheet.items.filter((i) => i.completed).length;

          if (renaming === sheet.id)
            return (
              <form
                key={sheet.id}
                className="sheets-rename"
                onSubmit={(e) => {
                  e.preventDefault();
                  finishRename();
                }}
              >
                <input
                  className="sheets-rename-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => e.key === "Escape" && setRenaming(null)}
                  aria-label="Sheet name"
                  maxLength={40}
                  autoFocus
                />
                <button type="submit" className="sheets-icon" title="Save name">
                  <FiCheck />
                </button>
              </form>
            );

          return (
            <button
              key={sheet.id}
              ref={isActive ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`sheets-tab ${isActive ? "is-active" : ""}`}
              onClick={() => onSelect(sheet.id)}
              onDoubleClick={startRename}
              title={isActive ? "Double-click to rename" : sheet.name}
            >
              <span className="sheets-name">{sheet.name}</span>
              {sheet.items.length > 0 && (
                <span className="sheets-count">
                  {done}/{sheet.items.length}
                </span>
              )}
            </button>
          );
        })}

        <button type="button" className="sheets-tab sheets-add" onClick={onAdd} title="New sheet (Shift+N)">
          <FiPlus />
        </button>
      </div>

      <div className="sheets-actions">
        <button type="button" className="sheets-icon" onClick={startRename} title="Rename sheet">
          <FiEdit2 />
        </button>
        <button
          type="button"
          className="sheets-icon"
          onClick={() => active && onDuplicate(active.id)}
          title="Duplicate sheet"
        >
          <FiCopy />
        </button>
        <button type="button" className="sheets-icon sheets-danger" onClick={remove} title="Delete sheet">
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
