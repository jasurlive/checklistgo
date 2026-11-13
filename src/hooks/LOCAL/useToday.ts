import { useEffect, useState } from 'react'
import { dateKey } from '../../lib/dates'

// today's date that also flips at midnight / when you come back to the tab next day
export function useToday() {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    const check = () =>
      setToday((prev) => (dateKey(prev) === dateKey(new Date()) ? prev : new Date()))
    const timer = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])

  return today
}
