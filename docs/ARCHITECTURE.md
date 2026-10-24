# Architecture

Paper Book is a web app (Svelte 5 + Three.js + PDF.js) inside a thin desktop shell (Tauri 2, Rust). The web app does all the reading; Rust only opens files and saves data.

```
┌──────────────────────── Desktop window (Tauri 2) ────────────────────────┐
│  Web UI (src/)                                                           │
│   App.svelte ─ wires features together                                   │
│     ├─ layout/      top bar, dock, page arrows, hint, drop overlay       │
│     ├─ features/    reader · pdf · bookmarks · scenes · themes · watch · magnifier │
│     ├─ engine/      BookRenderer (Three.js), page curl maths, canvas art │
│     ├─ design/      tokens, components, motion — the design system       │
│     ├─ stores/      settings (saved), ui (not saved)                     │
│     └─ platform/    web.ts (browser)  |  desktop.ts (calls Rust) ────────┼──┐
│                                                                          │  │ invoke
│  Rust core (src-tauri/src/)                                              │  │
│     files.rs    pick_pdf, read_pdf (only files picked in the dialog) ◄───┼──┘
│     storage.rs  storage_load, storage_save (one JSON file, portable aware)
└──────────────────────────────────────────────────────────────────────────┘
```

## Folders

```
src/
  main.ts              boot: load saved data → paint theme → mount App
  App.svelte           composes the screen and connects features (effects only, no logic)
  app.css              imports the design system's global CSS
  design/              THE DESIGN SYSTEM (see DESIGN-SYSTEM.md)
    tokens.css           colours, type, space, radius, shadows, layers, motion
    base.css             reset + text styles (.text-title, .text-body, …)
    motion.css           shared keyframes and the reduced-motion switch
    themes.ts            the six colour themes + the ripple transition
    actions/             use:feel (jelly, lean, bloop), use:ripple, transition pour
    components/          Button, Pill, Panel, Card, Tile, Switch, Slider, Segmented, Field, Toast, Icon
  engine/              rendering, no Svelte, no PDF.js
    BookRenderer.ts      the 3D book: pages, stacks, shadow, turning page, ribbons
    pageCurl.ts          pure page-bend maths (unit tested)
    turnMaterial.ts      shader for the turning page
    canvasArt.ts         page and shadow canvases
    ribbonArt.ts         ribbon textures (satin, tab, tassel)
  features/            one folder per thing the person can do
    reader/              open book state, turning, dragging, keyboard, the canvas
    pdf/                 PDF.js wrapper (only place that imports pdfjs-dist)
    bookmarks/           bookmark store, collections, ribbon layout, panel
    scenes/              scene data, backdrop, wallpaper, scene panel
    themes/              theme picker
    watch/               faces, the watch, its panel, reading clock and timer
    magnifier/           the loupe
  layout/              screen chrome that isn't a feature by itself
  stores/              settings.svelte.ts (saved), ui.svelte.ts (panels, toast, idle)
  platform/            Platform interface + web and desktop adapters
  lib/                 tiny helpers: motion, colour, sound, pointer
src-tauri/
  src/lib.rs           builder, plugins, commands
  src/files.rs         open dialog + reading picked PDFs
  src/storage.rs       data folder choice + atomic JSON save
  tauri.conf.json      window, CSP, bundle settings
  capabilities/        what the window is allowed to call
tests/
  unit/                Vitest: pure logic (spreads, curl, ribbons, bookmarks, themes, storage)
  e2e/                 Playwright: real browser against the built app
docs/                  this guide and friends
portable/              files shipped beside the .exe in the portable zip
```

## Rules for where code goes

1. **Dependencies point downward**: `App → layout/features → engine/design/stores/platform → lib`. A lower layer never imports a higher one. `engine/` never imports Svelte or PDF.js; `design/` never imports features.
2. **One owner per library.** Only `features/pdf/` imports `pdfjs-dist`. Only `engine/` and `features/reader/pageCache.ts` import `three`. Only `platform/desktop.ts` imports `@tauri-apps/api`.
3. **Pure where possible.** Maths and data shaping live in plain functions (`pageCurl.ts`, `spreads.ts`, `ribbonLayout.ts`, `withBookmark`) so they can be tested without a browser.
4. **State lives in stores**, as Svelte 5 runes in `.svelte.ts` files. Components read fields and call methods; they don't keep shared state of their own.
5. **Platform differences stay in `platform/`.** Features call `platform.pickPdf()`, `storage.get/set`; they never check which platform they're on.
6. **Data tables are the extension points.** Add a scene in `scenes.ts`, a theme in `themes.ts`, a collection in `collections.ts`, a watch face in `faces.ts`, an icon in `icons.ts`.

## How a page turn flows

1. `ReaderCanvas` gets a pointer event and asks `BookRenderer.pick()` what's under it.
2. `reader.pointerDown/Move/Up` (or `reader.turn()` for arrows and keys) decides the turn.
3. `reader.begin()` fetches textures from `PageCache` (which renders via `features/pdf`), lays the pages underneath and calls `book.startTurn()`.
4. Each frame, `book.curl(t)` bends the sheet with `pageCurl.ts`; ribbons fade out.
5. On landing, `reader.finish()` updates `spread`, plays the paper sound and calls `show()`, which bumps `reader.shown`.
6. `App.svelte`'s effect sees the change and recomputes ribbons with `ribbonsFor()`; the renderer fades them back in.

## Saved data

All saved data goes through `storage` from `$platform`: `settings`, `wallpaper`, `progress:<pdf id>`, `bm:<pdf id>`, `last`.

- Browser: `localStorage`, keys prefixed `pb:`.
- Desktop: one `paper-book.json` written by Rust, atomically. Folder: `PaperBookData/` beside the app if it exists (portable), otherwise the system app data folder. In portable mode on Windows, the web view's own cache also goes into `PaperBookData/webview`.

The PDF id is PDF.js's fingerprint, so bookmarks follow the file even if it's renamed or moved.

## Security

- The window can only read PDFs the person picked in the native dialog (`files.rs` keeps an allow-list).
- A strict Content Security Policy in `tauri.conf.json`: no remote scripts, no eval (PDF.js runs with `isEvalSupported: false`).
- `{@html}` is used only for our own SVG strings (icons, watch faces, scene art), never for text from a PDF or the person.
