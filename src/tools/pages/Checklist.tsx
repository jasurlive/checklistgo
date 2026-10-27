import { useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  FiCheck,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiPlus,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import "../css/checklist.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SortableItem from "../components/SortableItem";
import { useChecklist } from "../hooks/LOCAL/useChecklist";
import { useDnd } from "../hooks/LOCAL/useDnd";
import { useShortcuts } from "../hooks/LOCAL/useShortcuts";

export default function Checklist() {
  const list = useChecklist();
  const { sensors, onDragEnd } = useDnd(list.move);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    if (editingId) list.rename(editingId, text);
    else list.add(text);
    setEditingId(null);
    setInput("");
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setInput(text);
    inputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  const remove = (id: string) => {
    if (id === editingId) cancelEdit();
    list.remove(id);
  };

  useShortcuts({
    "ctrl+z": list.undo,
    "ctrl+shift+z": list.redo,
    "ctrl+y": list.redo,
    n: () => inputRef.current?.focus(),
  });

  const total = list.items.length;

  return (
    <div className="page-container">
      <Header
        title="ChecklistGo"
        subtitle={total ? `${list.done} of ${total} done` : "Your list is empty"}
      >
        <button
          type="button"
          className="page-button page-button-icon"
          onClick={list.undo}
          disabled={!list.canUndo}
          title="Undo (Ctrl+Z)"
        >
          <FiCornerUpLeft />
        </button>
        <button
          type="button"
          className="page-button page-button-icon"
          onClick={list.redo}
          disabled={!list.canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <FiCornerUpRight />
        </button>
      </Header>

      <main className="page-section">
        <form
          className="check-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            className="check-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
            placeholder={editingId ? "Edit item…" : "Add an item…"}
            aria-label="Item text"
            autoFocus
          />
          <button type="submit" className="check-submit" disabled={!input.trim()}>
            {editingId ? <FiCheck /> : <FiPlus />}
            <span>{editingId ? "Save" : "Add"}</span>
          </button>
          {editingId && (
            <button type="button" className="page-button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        {total > 0 && (
          <div className="check-progress" aria-hidden>
            <span style={{ width: `${(list.done / total) * 100}%` }} />
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={list.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="check-list">
              {list.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  editing={item.id === editingId}
                  onToggle={() => list.toggle(item.id)}
                  onEdit={() => startEdit(item.id, item.text)}
                  onRemove={() => remove(item.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {total === 0 && (
          <p className="check-empty page-text">
            Type something above and press Enter.
          </p>
        )}

        {total > 0 && (
          <div className="check-footer">
            <button
              type="button"
              className="page-button page-button-icon"
              onClick={list.clearCompleted}
              disabled={list.done === 0}
            >
              <FiXCircle /> Clear done
            </button>
            <button
              type="button"
              className="page-button page-button-icon check-danger"
              onClick={() => {
                cancelEdit();
                list.clearAll();
              }}
            >
              <FiTrash2 /> Clear all
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
