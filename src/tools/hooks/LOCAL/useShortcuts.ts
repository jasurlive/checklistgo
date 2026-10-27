import { useEffect } from 'react'

// keys: 'ctrl+k', 'shift+n', 'escape', 'alt+arrowup' ...
// ctrl also matches cmd on mac
// return false from an action to let the browser handle the key as usual
type Shortcuts = Record<string, (e: KeyboardEvent) => void | false>

const TYPING = ['INPUT', 'TEXTAREA', 'SELECT']

// inInputs: also fire while typing in a field (off by default)
export function useShortcuts(shortcuts: Shortcuts, { inInputs = false } = {}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement
      if (!inInputs && (el.isContentEditable || TYPING.includes(el.tagName))) return

      const combo = [
        (e.ctrlKey || e.metaKey) && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      const action = shortcuts[combo]
      if (action && action(e) !== false) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts, inInputs])
}
