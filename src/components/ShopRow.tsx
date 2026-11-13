import type { CSSProperties, HTMLAttributes } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEdit2, FiMenu, FiMinus, FiPlus, FiX } from "react-icons/fi";
import type { ShopItem } from "../lib/types";

type Props = {
  item: ShopItem;
  editing: boolean;
  onToggle: () => void;
  onQty: (qty: number) => void;
  onEdit: () => void;
  onRemove: () => void;
};

type DragProps = {
  setNodeRef?: (el: HTMLElement | null) => void;
  style?: CSSProperties;
  dragging?: boolean;
  handle?: HTMLAttributes<HTMLButtonElement>;
};

// one shopping row; tap = in cart / back on the list
export function ShopRow({ item, editing, onToggle, onQty, onEdit, onRemove, setNodeRef, style, dragging, handle }: Props & DragProps) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        "check-item",
        "shop-item",
        item.bought && "check-item-done",
        dragging && "check-item-dragging",
        editing && "check-item-editing",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
    >
      {handle && (
        <button type="button" className="check-handle" aria-label="Drag to reorder" onClick={stop} {...handle}>
          <FiMenu />
        </button>
      )}

      <input
        type="checkbox"
        className="check-box"
        checked={item.bought}
        onClick={stop}
        onChange={onToggle}
        aria-label={item.bought ? "Put back on the list" : "Mark as in cart"}
      />

      <span className="check-text">{item.name}</span>

      <div className="check-actions" onClick={stop}>
        {!item.bought && (
          <div className="shop-qty" aria-label={`Quantity ${item.qty}`}>
            <button
              type="button"
              className="check-action"
              onClick={() => onQty(item.qty - 1)}
              disabled={item.qty <= 1}
              title="Less"
            >
              <FiMinus />
            </button>
            <span className="shop-qty-value">{item.qty}</span>
            <button type="button" className="check-action" onClick={() => onQty(item.qty + 1)} title="More">
              <FiPlus />
            </button>
          </div>
        )}
        {item.bought && item.qty > 1 && <span className="shop-qty-value">×{item.qty}</span>}
        {!item.bought && (
          <button type="button" className="check-action" onClick={onEdit} title="Edit">
            <FiEdit2 />
          </button>
        )}
        <button type="button" className="check-action check-action-danger" onClick={onRemove} title="Delete">
          <FiX />
        </button>
      </div>
    </li>
  );
}

// same row inside the drag-and-drop list
export function SortableShopRow(props: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  return (
    <ShopRow
      {...props}
      setNodeRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      dragging={isDragging}
      handle={{ ...attributes, ...listeners }}
    />
  );
}
