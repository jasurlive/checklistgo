import { useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useHistory } from './useHistory'
import { newId } from './useSheets'
import { load, save } from '../../lib/storage'
import { addDays, dateKey } from '../../lib/dates'
import type { Habit } from '../../lib/types'

export const HABITS_KEY = 'habits'

const isHabit = (v: unknown): v is Habit =>
  !!v && typeof (v as Habit).id === 'string' && typeof (v as Habit).name === 'string'

export function normalizeHabits(list: unknown): Habit[] {
  return Array.isArray(list)
    ? list.filter(isHabit).map((h) => ({
        ...h,
        done: Array.isArray(h.done) ? h.done.filter((d) => typeof d === 'string') : [],
      }))
    : []
}

// days in a row up to today; today not ticked yet doesn't break it (counts from yesterday)
export function streak(habit: Habit, today: Date) {
  const done = new Set(habit.done)
  let day = done.has(dateKey(today)) ? today : addDays(today, -1)
  let n = 0
  while (done.has(dateKey(day))) {
    n++
    day = addDays(day, -1)
  }
  return n
}

// longest run ever
export function bestStreak(habit: Habit) {
  const days = [...new Set(habit.done)].sort()
  let best = 0
  let run = 0
  let prev = ''
  for (const d of days) {
    const [y, m, day] = d.split('-').map(Number)
    run = prev && dateKey(addDays(new Date(y, m - 1, day), -1)) === prev ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

// the habits: saved in localStorage, every change can be undone
export function useHabits() {
  const { state: habits, set, undo, redo, canUndo, canRedo } = useHistory<Habit[]>(() =>
    normalizeHabits(load<unknown>(HABITS_KEY, [])),
  )

  useEffect(() => save(HABITS_KEY, habits), [habits])

  return {
    habits,
    add: (name: string) => set((list) => [...list, { id: newId(), name, done: [] }]),
    rename: (id: string, name: string) => set((list) => list.map((h) => (h.id === id ? { ...h, name } : h))),
    remove: (id: string) => set((list) => list.filter((h) => h.id !== id)),
    // tick / untick one day
    toggle: (id: string, day: string) =>
      set((list) =>
        list.map((h) =>
          h.id !== id
            ? h
            : { ...h, done: h.done.includes(day) ? h.done.filter((d) => d !== day) : [...h.done, day] },
        ),
      ),
    move: (fromId: string, toId: string) =>
      set((list) => {
        const from = list.findIndex((h) => h.id === fromId)
        const to = list.findIndex((h) => h.id === toId)
        return from === -1 || to === -1 ? list : arrayMove(list, from, to)
      }),
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
