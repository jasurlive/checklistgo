import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useHistory } from './useHistory'
import { load, save } from '../../lib/storage'
import type { Item, Sheet } from '../../lib/types'

const SHEETS_KEY = 'sheets'
const ACTIVE_KEY = 'active-sheet'
// ChecklistGo v1/v2 saved a single list here; it becomes the first sheet
const LEGACY_KEY = 'items'

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

const isItem = (v: unknown): v is Item =>
  !!v && typeof (v as Item).id === 'string' && typeof (v as Item).text === 'string'

const isSheet = (v: unknown): v is Sheet =>
  !!v && typeof (v as Sheet).id === 'string' && typeof (v as Sheet).name === 'string' && Array.isArray((v as Sheet).items)

function loadSheets(): Sheet[] {
  const saved = load<unknown>(SHEETS_KEY, null)
  if (Array.isArray(saved)) {
    const sheets = saved.filter(isSheet).map((s) => ({ ...s, items: s.items.filter(isItem) }))
    if (sheets.length) return sheets
  }

  const legacy = load<unknown>(LEGACY_KEY, [])
  const items = Array.isArray(legacy) ? legacy.filter(isItem) : []
  return [{ id: newId(), name: 'My list', items }]
}

// name that isn't taken yet: "List 2", "List 3"...
function freeName(sheets: Sheet[], base = 'List') {
  const names = new Set(sheets.map((s) => s.name.toLowerCase()))
  let n = sheets.length + 1
  while (names.has(`${base} ${n}`.toLowerCase())) n++
  return `${base} ${n}`
}

// first sheet whose object changed between two states, so undo / redo can jump to it
function changedSheet(from: Sheet[], to: Sheet[]) {
  const before = new Map(from.map((s) => [s.id, s]))
  return to.find((s) => before.get(s.id) !== s)?.id
}

// all sheets saved in localStorage; every change (items and sheets) can be undone
export function useSheets() {
  const history = useHistory<Sheet[]>(loadSheets)
  const sheets = history.state
  const [activeId, setActiveId] = useState(() => load<string>(ACTIVE_KEY, ''))

  // fall back to the first sheet if the saved one is gone (deleted, undone...)
  const active = sheets.find((s) => s.id === activeId) ?? sheets[0]

  useEffect(() => save(SHEETS_KEY, sheets), [sheets])
  useEffect(() => save(ACTIVE_KEY, active.id), [active.id])

  // change the items of the active sheet
  const setItems = (fn: (items: Item[]) => Item[]) =>
    history.set((list) =>
      list.map((s) => {
        if (s.id !== active.id) return s
        const items = fn(s.items)
        return items === s.items ? s : { ...s, items }
      }),
    )

  const update = (id: string, patch: Partial<Item>) =>
    setItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  const travel = (target: Sheet[] | undefined, go: () => void) => {
    if (!target) return
    const id = changedSheet(sheets, target)
    if (id) setActiveId(id)
    go()
  }

  return {
    sheets,
    active,
    items: active.items,
    done: active.items.filter((item) => item.completed).length,

    // sheets
    select: (id: string) => setActiveId(id),
    selectOffset: (offset: number) => {
      const i = sheets.findIndex((s) => s.id === active.id)
      setActiveId(sheets[(i + offset + sheets.length) % sheets.length].id)
    },
    addSheet: (name?: string) => {
      const sheet: Sheet = { id: newId(), name: name?.trim() || freeName(sheets), items: [] }
      history.set((list) => [...list, sheet])
      setActiveId(sheet.id)
    },
    renameSheet: (id: string, name: string) =>
      history.set((list) => list.map((s) => (s.id === id ? { ...s, name } : s))),
    duplicateSheet: (id: string) => {
      const source = sheets.find((s) => s.id === id)
      if (!source) return
      const copy: Sheet = {
        id: newId(),
        name: `${source.name} (copy)`,
        items: source.items.map((item) => ({ ...item, id: newId() })),
      }
      history.set((list) => {
        const i = list.findIndex((s) => s.id === id)
        return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)]
      })
      setActiveId(copy.id)
    },
    removeSheet: (id: string) => {
      const i = sheets.findIndex((s) => s.id === id)
      const rest = sheets.filter((s) => s.id !== id)
      // always keep one sheet around
      history.set(rest.length ? rest : [{ id: newId(), name: 'My list', items: [] }])
      if (id === active.id && rest.length) setActiveId(rest[Math.max(0, i - 1)].id)
    },

    // items of the active sheet
    add: (text: string) => setItems((items) => [...items, { id: newId(), text, completed: false }]),
    rename: (id: string, text: string) => update(id, { text }),
    toggle: (id: string) =>
      setItems((items) => items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))),
    remove: (id: string) => setItems((items) => items.filter((item) => item.id !== id)),
    move: (fromId: string, toId: string) =>
      setItems((items) => {
        const from = items.findIndex((item) => item.id === fromId)
        const to = items.findIndex((item) => item.id === toId)
        return from === -1 || to === -1 ? items : arrayMove(items, from, to)
      }),
    clearCompleted: () =>
      setItems((items) => (items.some((i) => i.completed) ? items.filter((item) => !item.completed) : items)),
    clearAll: () => setItems((items) => (items.length ? [] : items)),

    undo: () => travel(history.prev, history.undo),
    redo: () => travel(history.next, history.redo),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  }
}
