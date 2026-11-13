import { useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { FiCheck, FiCornerUpLeft, FiCornerUpRight, FiPlus } from "react-icons/fi";
import "../css/checklist.css";
import "../css/habits.css";
import Header from "../components/Header";
import HabitRow from "../components/HabitRow";
import { useHabits } from "../hooks/LOCAL/useHabits";
import { useDnd } from "../hooks/LOCAL/useDnd";
import { useShortcuts } from "../hooks/LOCAL/useShortcuts";
import { useToday } from "../hooks/LOCAL/useToday";
import { dateKey } from "../lib/dates";

const EXAMPLES = ["Drink water", "Read 20 min", "Walk 10k steps", "Stretch", "No sugar"];

export default function Habits() {
  const list = useHabits();
  const today = useToday();
  const { sensors, onDragEnd } = useDnd(list.move);
  const [input, setInput] = useState("");
  const [editId, setEditingId] = useState<string | null>(null);
  const editingId = editId && list.habits.some((h) => h.id === editId) ? editId : null;
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const name = input.trim();
    if (!name) return;
    if (editingId) list.rename(editingId, name);
    else list.add(name);
    setEditingId(null);
    setInput("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  // listed on the Settings page: keep both in sync
  useShortcuts({
    "ctrl+z": list.undo,
    "ctrl+shift+z": list.redo,
    "ctrl+y": list.redo,
    n: () => inputRef.current?.focus(),
  });

  const todayKey = dateKey(today);
  const total = list.habits.length;
  const doneToday = list.habits.filter((h) => h.done.includes(todayKey)).length;
  const dayName = today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="page-container">
      <Header
        title="Habits"
        subtitle={total ? `${dayName} · ${doneToday} of ${total} done` : dayName}
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

      <main className="check-main">
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
            placeholder={editingId ? "Rename habit…" : "New daily habit…"}
            aria-label="Habit name"
            maxLength={60}
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
            <span style={{ width: `${(doneToday / total) * 100}%` }} />
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={list.habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
            <ul className="check-list">
              {list.habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  today={today}
                  editing={habit.id === editingId}
                  onToggle={(day) => list.toggle(habit.id, day)}
                  onEdit={() => {
                    setEditingId(habit.id);
                    setInput(habit.name);
                    inputRef.current?.focus();
                  }}
                  onRemove={() => {
                    if (habit.id === editingId) cancelEdit();
                    list.remove(habit.id);
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {total === 0 && (
          <div className="check-empty">
            <p className="page-text">
              Habits reset every day. Tick them off, keep the streak going.
            </p>
            <div className="habit-examples">
              {EXAMPLES.map((name) => (
                <button key={name} type="button" className="page-button" onClick={() => list.add(name)}>
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {total > 0 && total === doneToday && (
          <p className="check-empty page-text">All done for today. See you tomorrow!</p>
        )}
      </main>
    </div>
  );
}
