// local calendar dates as "YYYY-MM-DD" (not toISOString, that's UTC)

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const addDays = (d: Date, days: number) => {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

// the last `n` days, oldest first, ending today
export const lastDays = (today: Date, n: number) =>
  Array.from({ length: n }, (_, i) => addDays(today, i - n + 1))

// "just now", "5 min ago", "yesterday", "3 days ago"; older than a week -> date
export function timeAgo(time: number, now = Date.now()) {
  const sec = Math.round((time - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (Math.abs(sec) < 45) return 'just now'
  if (Math.abs(sec) < 3600) return rtf.format(Math.round(sec / 60), 'minute')
  if (Math.abs(sec) < 86400) return rtf.format(Math.round(sec / 3600), 'hour')
  if (Math.abs(sec) < 7 * 86400) return rtf.format(Math.round(sec / 86400), 'day')
  return new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
