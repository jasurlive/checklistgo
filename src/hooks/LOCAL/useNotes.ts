import { useEffect, useState } from 'react'
import { newId } from './useSheets'
import { load, save } from '../../lib/storage'
import type { Note } from '../../lib/types'

export const NOTES_KEY = 'notes'

export function normalizeNotes(list: unknown): Note[] {
  if (!Array.isArray(list)) return []
  const now = Date.now()
  return list
    .filter((n): n is Note => !!n && typeof (n as Note).text === 'string')
    .map((n) => ({
      id: typeof n.id === 'string' ? n.id : newId(),
      text: n.text,
      pinned: !!n.pinned,
      createdAt: Number(n.createdAt) || now,
      updatedAt: Number(n.updatedAt) || now,
    }))
}

const dropEmpty = (list: Note[], keepId?: string) => {
  const kept = list.filter((n) => n.text.trim() || n.id === keepId)
  return kept.length === list.length ? list : kept
}

export const noteTitle = (note: Note) => note.text.trim().split('\n')[0].slice(0, 80) || 'New note'
export const notePreview = (note: Note) => note.text.trim().split('\n').slice(1).join(' ').trim()

// notes saved in localStorage; no undo history (typing would flood it), deleting has its own undo
// openId: the note being edited; every other empty note is dropped when it changes
export function useNotes(openId?: string) {
  const [notes, setNotes] = useState<Note[]>(() => dropEmpty(normalizeNotes(load<unknown>(NOTES_KEY, [])), openId))
  const [prevOpenId, setPrevOpenId] = useState(openId)

  // opened another note / went back to the list: adjust during render (no effect needed)
  if (prevOpenId !== openId) {
    setPrevOpenId(openId)
    setNotes((list) => dropEmpty(list, openId))
  }

  useEffect(() => save(NOTES_KEY, notes), [notes])

  // pinned first, then most recently edited
  const sorted = [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
  )

  const patch = (id: string, change: Partial<Note>, touch = true) =>
    setNotes((list) =>
      list.map((n) => (n.id === id ? { ...n, ...change, ...(touch && { updatedAt: Date.now() }) } : n)),
    )

  return {
    notes: sorted,
    create: () => {
      const now = Date.now()
      const note: Note = { id: newId(), text: '', pinned: false, createdAt: now, updatedAt: now }
      setNotes((list) => [...list, note])
      return note.id
    },
    write: (id: string, text: string) => patch(id, { text }),
    togglePin: (id: string) =>
      setNotes((list) => list.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))),
    remove: (id: string) => setNotes((list) => list.filter((n) => n.id !== id)),
    restore: (note: Note) => setNotes((list) => (list.some((n) => n.id === note.id) ? list : [...list, note])),
  }
}
