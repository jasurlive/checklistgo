# ChecklistGo

<img width="70%" alt="image" src="https://github.com/user-attachments/assets/e21edceb-4047-4286-be92-e07c7834ca05" />

<img width="40%" alt="image" src="https://github.com/user-attachments/assets/a502eda4-d759-4cc8-868a-9b8e76e5d2c0" />



Offline checklist for daily use: add, edit, tick off and drag to reorder items.
Everything is saved in your browser (localStorage); once loaded it works without internet.

Built on the [django-react](https://github.com/jasurlive/django-react) `front/` template
(React 19 + TypeScript + Vite, React Router, react-icons, React Compiler). No backend needed.

## Features

- **Sheets**: as many separate checklists as you want (groceries, work, packing…), each a tab; add, rename (double-click), duplicate, delete
- **Shopping list** tab: quantities ("2 milk", "eggs x12", +/− buttons), adding an existing item bumps its amount, ticked items move to "In cart", "Buy again" chips from what you add most, copy the list as text
- **Habits** tab: daily habits that untick every day, streak + best streak, 7-day dots (tap one to fix a past day), drag to reorder, undo / redo
- **Notes** tab: plain-text notes (first line = title), search, pin to top, delete with undo, empty notes removed automatically
- Add / edit / delete items, tap an item to tick it off
- Drag the handle to reorder (mouse, touch, keyboard) — `@dnd-kit`
- Undo / redo for every change, including deleted sheets (jumps to the sheet that changed)
- Progress bar, "Clear done", "Clear all"
- 7 themes (light, dark + linen, fjord, matte, charcoal, paper; turn extras off with `VITE_ENABLE_EXTRA_THEMES=false` in `.env`)
- Settings page: theme picker, fullscreen, backup export / import (JSON: sheets, shopping, habits, notes), shortcuts, tips, ©
- Liquid-glass sidebar on desktop (collapse state remembered), floating bar on mobile
- Installable PWA with an offline service worker (production build)
- Lists saved by ChecklistGo v1/v2 (`items` key) become the first sheet automatically

## Shortcuts

| Keys | Does |
| --- | --- |
| `N` | focus the input (Notes: new note) |
| `Enter` / `Esc` | add or save / cancel editing, close a note |
| `Ctrl+Z` | undo |
| `Ctrl+Shift+Z`, `Ctrl+Y` | redo |
| `Shift+N` | new sheet |
| `[` / `]` | previous / next sheet |
| `Ctrl+J` | next theme |
| `` ` `` | collapse / expand sidebar |

## Run

```bash
npm install
npm run dev          # http://localhost:1212
```

Needs Node 20.19+ or 22.12+.

| Command | Does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build (`dist/`) |
| `npm run preview` | serve the build (service worker active) |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |

## Structure

```
src/
├── app/               main.tsx (+ service worker), App.tsx (routes), env.d.ts
├── pages/             Checklist, Shopping, Habits, Notes, Settings, NotFound
├── components/        Layout, Header, SheetTabs, SortableItem, ShopRow, HabitRow, ErrorBoundary
├── shared/            Menu (sidebar / mobile bar), ThemeIcons
├── hooks/LOCAL/       useSheets, useShopping, useHabits, useNotes, useToday, useHistory, useDnd, useShortcuts, useTheme, useFullscreen
├── lib/               storage (safe localStorage), dates, themes, types
└── css/               reset, theme, page, menu, header, checklist, sheets, shopping, habits, notes
public/                check.png, manifest.json, service-worker.js
vercel.json            SPA rewrite so /shopping, /notes/… etc. work on reload
```

localStorage keys: `sheets` (all sheets + items), `active-sheet`, `shopping`, `shopping-frequent`, `habits`, `notes`, `theme`, `menu-collapsed`.

Add a page: create it in `src/pages`, add a `<Route>` in `src/app/App.tsx` and an item in `src/shared/Menu.tsx`.

© 2019–present [jasurlive.uz](https://jasurlive.uz)
