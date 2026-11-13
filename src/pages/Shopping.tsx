import { useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  FiCheck,
  FiClipboard,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiPlus,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import "../css/checklist.css";
import "../css/shopping.css";
import Header from "../components/Header";
import { ShopRow, SortableShopRow } from "../components/ShopRow";
import { formatItem, useShopping } from "../hooks/LOCAL/useShopping";
import { useDnd } from "../hooks/LOCAL/useDnd";
import { useShortcuts } from "../hooks/LOCAL/useShortcuts";

export default function Shopping() {
  const shop = useShopping();
  const { sensors, onDragEnd } = useDnd(shop.move);
  const [input, setInput] = useState("");
  const [editId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // only while that item is still on the "to buy" list (undo can move it)
  const editingId = editId && shop.toBuy.some((i) => i.id === editId) ? editId : null;
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!input.trim()) return;
    if (editingId) shop.edit(editingId, input);
    else shop.add(input);
    setEditingId(null);
    setInput("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  const copyList = async () => {
    const text = shop.toBuy.map((i) => `• ${formatItem(i)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (http, old browser): nothing to do
    }
  };

  // listed on the Settings page: keep both in sync
  useShortcuts({
    "ctrl+z": shop.undo,
    "ctrl+shift+z": shop.redo,
    "ctrl+y": shop.redo,
    n: () => inputRef.current?.focus(),
  });

  const rowProps = (id: string) => ({
    editing: id === editingId,
    onToggle: () => shop.toggle(id),
    onQty: (qty: number) => shop.setQty(id, qty),
    onEdit: () => {
      const item = shop.items.find((i) => i.id === id);
      if (!item) return;
      setEditingId(id);
      setInput(formatItem(item));
      inputRef.current?.focus();
    },
    onRemove: () => {
      if (id === editingId) cancelEdit();
      shop.remove(id);
    },
  });

  const total = shop.items.length;

  return (
    <div className="page-container">
      <Header
        title="Shopping"
        subtitle={
          total ? `${shop.toBuy.length} to buy · ${shop.cart.length} in cart` : "Nothing to buy"
        }
      >
        <button
          type="button"
          className="page-button page-button-icon"
          onClick={copyList}
          disabled={!shop.toBuy.length}
          title="Copy list as text"
        >
          {copied ? <FiCheck /> : <FiClipboard />}
        </button>
        <button
          type="button"
          className="page-button page-button-icon"
          onClick={shop.undo}
          disabled={!shop.canUndo}
          title="Undo (Ctrl+Z)"
        >
          <FiCornerUpLeft />
        </button>
        <button
          type="button"
          className="page-button page-button-icon"
          onClick={shop.redo}
          disabled={!shop.canRedo}
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
            placeholder={editingId ? "Edit item…" : "Add an item… e.g. 2 milk"}
            aria-label="Item and quantity"
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

        {shop.suggestions.length > 0 && !editingId && (
          <div className="shop-chips">
            <span className="shop-chips-label">Buy again:</span>
            {shop.suggestions.map((name) => (
              <span key={name} className="shop-chip" role="button" tabIndex={0}
                onClick={() => shop.add(name)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), shop.add(name))}
                title={`Add ${name}`}
              >
                {name}
                <button
                  type="button"
                  className="shop-chip-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    shop.forget(name);
                  }}
                  aria-label={`Forget ${name}`}
                  title="Don't suggest this"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="check-progress" aria-hidden>
            <span style={{ width: `${(shop.cart.length / total) * 100}%` }} />
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={shop.toBuy.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="check-list">
              {shop.toBuy.map((item) => (
                <SortableShopRow key={item.id} item={item} {...rowProps(item.id)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {total === 0 && (
          <p className="check-empty page-text">
            Type what you need and press Enter. "2 milk" or "eggs x12" sets the amount.
          </p>
        )}
        {total > 0 && shop.toBuy.length === 0 && (
          <p className="check-empty page-text">All done, everything is in the cart.</p>
        )}

        {shop.cart.length > 0 && (
          <>
            <div className="shop-section">
              <span>In cart · {shop.cart.length}</span>
              <button type="button" className="page-button page-button-icon" onClick={shop.clearCart}>
                <FiXCircle /> Clear cart
              </button>
            </div>
            <ul className="check-list">
              {shop.cart.map((item) => (
                <ShopRow key={item.id} item={item} {...rowProps(item.id)} />
              ))}
            </ul>
          </>
        )}

        {total > 0 && (
          <div className="check-footer">
            <span />
            <button
              type="button"
              className="page-button page-button-icon check-danger"
              onClick={() => {
                cancelEdit();
                shop.clearAll();
              }}
            >
              <FiTrash2 /> Clear all
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
