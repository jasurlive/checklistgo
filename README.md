# ChecklistGo

Offline checklist for daily use: add, edit, tick off and drag to reorder items.
Everything is saved in your browser (localStorage); once loaded it works without internet.

Built on the [django-react](https://github.com/jasurlive/django-react) `front/` template
(React 19 + TypeScript + Vite, React Router, react-icons, React Compiler). No backend needed.

## Features

- Add / edit / delete items, tap an item to tick it off
- Drag the handle to reorder (mouse, touch, keyboard) — `@dnd-kit`
- Undo / redo for every change
- Progress bar, "Clear done", "Clear all"
- Light / dark theme, sidebar on desktop, bottom bar on mobile
- Installable PWA with an offline service worker (production build)
- Lists saved by ChecklistGo v1 load automatically (same `items` key)

## Shortcuts

| Keys | Does |
| --- | --- |
| `N` | focus the input |
| `Enter` / `Esc` | add or save / cancel editing |
| `Ctrl+Z` | undo |
| `Ctrl+Shift+Z`, `Ctrl+Y` | redo |
| `Ctrl+J` | toggle theme |

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
├── ts/                    entry: main.tsx (+ service worker), App.tsx (routes)
└── tools/
    ├── pages/             Checklist, Help, NotFound
    ├── components/        Layout, Header, Footer, SortableItem, ErrorBoundary
    ├── shared/            Menu (sidebar / mobile bar)
    ├── hooks/LOCAL/       useChecklist, useHistory, useDnd, useShortcuts, useTheme
    ├── lib/storage.ts     safe localStorage load / save
    ├── types.ts
    └── css/               reset, theme, page, menu, header, checklist
public/                    check.png, manifest.json, service-worker.js
vercel.json                SPA rewrite so /help works on reload
```

Add a page: create it in `tools/pages`, add a `<Route>` in `src/ts/App.tsx` and an item in `tools/shared/Menu.tsx`.

© 2019–present [jasurlive.uz](https://jasurlive.uz)
