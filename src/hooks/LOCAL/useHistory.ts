import { useState } from 'react'

type History<T> = { past: T[]; present: T; future: T[] }

// state with undo / redo, capped at `limit` steps
export function useHistory<T>(initial: T | (() => T), limit = 200) {
  const [history, setHistory] = useState<History<T>>(() => ({
    past: [],
    present: typeof initial === 'function' ? (initial as () => T)() : initial,
    future: [],
  }))

  const set = (next: T | ((prev: T) => T)) =>
    setHistory(({ past, present, future }) => {
      const value = typeof next === 'function' ? (next as (prev: T) => T)(present) : next
      if (Object.is(value, present)) return { past, present, future }
      return { past: [...past, present].slice(-limit), present: value, future: [] }
    })

  const undo = () =>
    setHistory((h) =>
      h.past.length
        ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
        : h,
    )

  const redo = () =>
    setHistory((h) =>
      h.future.length
        ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
        : h,
    )

  return {
    state: history.present,
    // what undo / redo would switch to (undefined when there's nothing)
    prev: history.past[history.past.length - 1] as T | undefined,
    next: history.future[0] as T | undefined,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
