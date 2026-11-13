import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useHistory } from './useHistory'
import { newId } from './useSheets'
import { load, save } from '../../lib/storage'
import type { ShopItem } from '../../lib/types'

export const SHOP_KEY = 'shopping'
// how often each name was added, for the "Buy again" chips (not part of undo)
export const FREQ_KEY = 'shopping-frequent'

type Freq = Record<string, { name: string; count: number }>

const clampQty = (n: number) => Math.min(999, Math.max(1, Math.round(n) || 1))

// "2 milk", "milk x2", "milk ×2", "milk" -> { name, qty }
export function parseItem(input: string) {
  const text = input.trim().replace(/\s+/g, ' ')
  const front = text.match(/^(\d+)\s*[x×]?\s+(.+)$/i)
  if (front) return { name: front[2], qty: clampQty(+front[1]) }
  const back = text.match(/^(.+?)\s*[x×]\s*(\d+)$/i)
  if (back) return { name: back[1], qty: clampQty(+back[2]) }
  return { name: text, qty: 1 }
}

export const formatItem = (item: Pick<ShopItem, 'name' | 'qty'>) =>
  item.qty > 1 ? `${item.qty} ${item.name}` : item.name

const isShopItem = (v: unknown): v is ShopItem =>
  !!v && typeof (v as ShopItem).id === 'string' && typeof (v as ShopItem).name === 'string'

function loadItems(): ShopItem[] {
  const saved = load<unknown>(SHOP_KEY, [])
  return Array.isArray(saved)
    ? saved.filter(isShopItem).map((i) => ({ ...i, qty: clampQty(i.qty), bought: !!i.bought }))
    : []
}

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// the shopping list: saved in localStorage, every change can be undone
export function useShopping() {
  const { state: items, set, undo, redo, canUndo, canRedo } = useHistory<ShopItem[]>(loadItems)
  const [freq, setFreq] = useState<Freq>(() => load<Freq>(FREQ_KEY, {}))

  useEffect(() => save(SHOP_KEY, items), [items])
  useEffect(() => save(FREQ_KEY, freq), [freq])

  const remember = (name: string) =>
    setFreq((f) => {
      const key = name.toLowerCase()
      return { ...f, [key]: { name, count: (f[key]?.count ?? 0) + 1 } }
    })

  const toBuy = items.filter((i) => !i.bought)
  const cart = items.filter((i) => i.bought)

  // most-added names that aren't already on the list
  const suggestions = Object.values(freq)
    .filter((f) => !toBuy.some((i) => sameName(i.name, f.name)))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((f) => f.name)

  const update = (id: string, patch: Partial<ShopItem>) =>
    set((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  return {
    items,
    toBuy,
    cart,
    suggestions,

    // adding a name that's already there bumps it instead of duplicating
    add: (input: string) => {
      const { name, qty } = parseItem(input)
      if (!name) return
      remember(name)
      set((list) => {
        const found = list.find((i) => sameName(i.name, name))
        if (!found) return [...list, { id: newId(), name, qty, bought: false }]
        return list.map((i) =>
          i.id === found.id ? { ...i, qty: i.bought ? qty : clampQty(i.qty + qty), bought: false } : i,
        )
      })
    },
    edit: (id: string, input: string) => {
      const { name, qty } = parseItem(input)
      if (name) update(id, { name, qty })
    },
    setQty: (id: string, qty: number) => update(id, { qty: clampQty(qty) }),
    toggle: (id: string) => set((list) => list.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i))),
    remove: (id: string) => set((list) => list.filter((i) => i.id !== id)),
    move: (fromId: string, toId: string) =>
      set((list) => {
        const from = list.findIndex((i) => i.id === fromId)
        const to = list.findIndex((i) => i.id === toId)
        return from === -1 || to === -1 ? list : arrayMove(list, from, to)
      }),
    clearCart: () => set((list) => (list.some((i) => i.bought) ? list.filter((i) => !i.bought) : list)),
    clearAll: () => set((list) => (list.length ? [] : list)),
    forget: (name: string) =>
      setFreq((f) => {
        const next = { ...f }
        delete next[name.toLowerCase()]
        return next
      }),

    undo,
    redo,
    canUndo,
    canRedo,
  }
}
