import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEdit2, FiMenu, FiX } from "react-icons/fi";
import type { Item } from "../lib/types";

export default function SortableItem({
  item,
  editing,
  onToggle,
  onEdit,
  onRemove,
}: {
  item: Item;
  editing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        "check-item",
        item.completed && "check-item-done",
        isDragging && "check-item-dragging",
        editing && "check-item-editing",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
    >
      <button
        type="button"
        className="check-handle"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <FiMenu />
      </button>

      <input
        type="checkbox"
        className="check-box"
        checked={item.completed}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
        aria-label={item.completed ? "Mark as not done" : "Mark as done"}
      />

      <span className="check-text">{item.text}</span>

      <div className="check-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="check-action" onClick={onEdit} title="Edit">
          <FiEdit2 />
        </button>
        <button
          type="button"
          className="check-action check-action-danger"
          onClick={onRemove}
          title="Delete"
        >
          <FiX />
        </button>
      </div>
    </li>
  );
}
