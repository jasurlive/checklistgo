import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiCheck, FiEdit2, FiMenu, FiX } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { bestStreak, streak } from "../hooks/LOCAL/useHabits";
import { dateKey, lastDays } from "../lib/dates";
import type { Habit } from "../lib/types";

// one habit: big check for today, streak, and the last 7 days (tap a dot to fix a past day)
export default function HabitRow({
  habit,
  today,
  editing,
  onToggle,
  onEdit,
  onRemove,
}: {
  habit: Habit;
  today: Date;
  editing: boolean;
  onToggle: (day: string) => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  const todayKey = dateKey(today);
  const doneToday = habit.done.includes(todayKey);
  const current = streak(habit, today);
  const best = bestStreak(habit);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        "habit",
        doneToday && "habit-done",
        isDragging && "check-item-dragging",
        editing && "check-item-editing",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onToggle(todayKey)}
    >
      <button
        type="button"
        className="check-handle habit-handle"
        aria-label="Drag to reorder"
        onClick={stop}
        {...attributes}
        {...listeners}
      >
        <FiMenu />
      </button>

      <button
        type="button"
        className="habit-check"
        aria-pressed={doneToday}
        aria-label={doneToday ? "Not done today" : "Done today"}
        onClick={(e) => {
          stop(e);
          onToggle(todayKey);
        }}
      >
        <FiCheck />
      </button>

      <div className="habit-main">
        <span className="habit-name">{habit.name}</span>
        <span className="habit-meta">
          <LuFlame className={current ? "habit-flame is-on" : "habit-flame"} />
          {current} day{current === 1 ? "" : "s"}
          {best > current && <span> · best {best}</span>}
        </span>
      </div>

      <div className="habit-week" onClick={stop}>
        {lastDays(today, 7).map((day) => {
          const key = dateKey(day);
          const done = habit.done.includes(key);
          const label = day.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
          return (
            <button
              key={key}
              type="button"
              className={`habit-day ${done ? "is-done" : ""} ${key === todayKey ? "is-today" : ""}`}
              onClick={() => onToggle(key)}
              title={`${label}: ${done ? "done" : "not done"}`}
              aria-label={`${label}, ${done ? "done" : "not done"}`}
            >
              <span className="habit-day-letter">{day.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              <span className="habit-day-dot" />
            </button>
          );
        })}
      </div>

      <div className="check-actions habit-actions" onClick={stop}>
        <button type="button" className="check-action" onClick={onEdit} title="Rename">
          <FiEdit2 />
        </button>
        <button type="button" className="check-action check-action-danger" onClick={onRemove} title="Delete">
          <FiX />
        </button>
      </div>
    </li>
  );
}
