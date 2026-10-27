import { useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useHistory } from './useHistory'
import { load, save } from '../../lib/storage'
import type { Item } from '../../types'

// same key as ChecklistGo v1, so saved lists carry over
const KEY = 'items'

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

function loadItems(): Item[] {
  const items = load<unknown>(KEY, [])
  return Array.isArray(items) ? (items as Item[]) : []
}

// the list: saved in localStorage, every change can be undone
export function useChecklist() {
  const { state: items, set, undo, redo, canUndo, canRedo } = useHistory<Item[]>(loadItems)

  useEffect(() => save(KEY, items), [items])

  const update = (id: string, patch: Partial<Item>) =>
    set((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  return {
    items,
    done: items.filter((item) => item.completed).length,
    add: (text: string) => set((list) => [...list, { id: newId(), text, completed: false }]),
    rename: (id: string, text: string) => update(id, { text }),
    toggle: (id: string) =>
      set((list) => list.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))),
    remove: (id: string) => set((list) => list.filter((item) => item.id !== id)),
    move: (fromId: string, toId: string) =>
      set((list) => {
        const from = list.findIndex((item) => item.id === fromId)
        const to = list.findIndex((item) => item.id === toId)
        return from === -1 || to === -1 ? list : arrayMove(list, from, to)
      }),
    clearCompleted: () => set((list) => list.filter((item) => !item.completed)),
    clearAll: () => set([]),
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
