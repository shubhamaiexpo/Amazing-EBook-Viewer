# Paper Book

Open any PDF as a real book. Pages curl and turn by hand, the room around the book sets its light, satin ribbons mark your favourite pages, and a little watch keeps reading time.

Built with [Tauri 2](https://tauri.app) (a small Rust core) and a Svelte 5 + Three.js web UI. It runs as a portable Windows app (no installer, works from a USB stick), and the same code builds for macOS and Linux.

## Quick start

```bash
npm install
npm run dev          # the reader in your browser at http://localhost:1420
npm run app:dev      # the same reader inside the desktop window (needs Rust, see below)
```

Before you push, run everything CI runs:

```bash
npm run verify       # format check, lint, type check, unit tests, build
npm run test:e2e     # browser tests against the built app
cd src-tauri && cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
```

## Build the desktop app

```bash
npm run app:portable # single .exe in src-tauri/target/release/ (portable)
npm run app:build    # installers: .exe setup (Windows), .dmg (macOS), .AppImage/.deb (Linux)
```

To run portable from a USB stick, put `paper-book.exe` next to an empty folder named `PaperBookData`. The release zip is already laid out this way.

## Where things are

| Read this                                      | For                                                           |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)     | Setup, the day-to-day loop, branches, reviews and releases    |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   | Folder layout, how the pieces talk, rules for where code goes |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Tokens, components and motion, and how to change the look     |
| [docs/ROADMAP.md](docs/ROADMAP.md)             | Milestones from first Windows release to phones and tablets   |

## Keyboard

| Key                      | Does                     |
| ------------------------ | ------------------------ |
| → / PageDown / Space     | Next spread              |
| ← / PageUp / Shift+Space | Previous spread          |
| Home / End               | First / last page        |
| B                        | Bookmark this page       |
| Z                        | Magnifier (scroll zooms) |
| Esc                      | Close magnifier or panel |
