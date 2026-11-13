export type Item = {
  id: string
  text: string
  completed: boolean
}

// one checklist; the app keeps several of these
export type Sheet = {
  id: string
  name: string
  items: Item[]
}

// shopping list entry: "2 × Milk"
export type ShopItem = {
  id: string
  name: string
  qty: number
  bought: boolean
}

// daily habit; `done` = local dates it was ticked ("2026-11-13")
export type Habit = {
  id: string
  name: string
  done: string[]
}

// plain-text note; the first line is the title
export type Note = {
  id: string
  text: string
  pinned: boolean
  createdAt: number
  updatedAt: number
}
