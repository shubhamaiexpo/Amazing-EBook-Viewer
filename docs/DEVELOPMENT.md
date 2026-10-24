# Development guide

How we build Paper Book, from a fresh machine to a release. Every step is here so anyone can pick the project up.

## 1. Set up a machine (once)

| Tool                | Version       | Why                                                            |
| ------------------- | ------------- | -------------------------------------------------------------- |
| Node.js             | 22 LTS        | Web UI, build tools, tests                                     |
| Rust (rustup)       | stable, 1.77+ | The desktop core                                               |
| Tauri prerequisites | see below     | System libraries for the desktop window                        |
| VS Code (suggested) | latest        | With the Svelte, rust-analyzer, ESLint and Prettier extensions |

Tauri prerequisites by system ([full list](https://tauri.app/start/prerequisites/)):

- **Windows:** Microsoft C++ Build Tools ("Desktop development with C++"). WebView2 is already on Windows 10 and 11.
- **macOS:** `xcode-select --install`.
- **Linux (Debian/Ubuntu):** `sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev libayatana-appindicator3-dev patchelf build-essential`.

Then:

```bash
git clone <repo-url> paper-book && cd paper-book
npm install
npx playwright install chromium   # once, for browser tests
```

## 2. The daily loop

1. **Start from main.** `git switch main && git pull`.
2. **Branch per change.** `git switch -c feat/ribbon-labels` (prefixes: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`).
3. **Run it.**
   - `npm run dev` for UI work: fast reloads in the browser. Everything except the native file dialog and the portable data folder works here.
   - `npm run app:dev` when you touch Rust, file opening, storage or window behaviour.
4. **Write the change where it belongs.** See [ARCHITECTURE.md](ARCHITECTURE.md). If you need a colour, size or radius, use a token from [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); add a token if it's missing, never a raw value in a component.
5. **Test as you go.** Logic that can be a pure function (page maths, ribbon layout, bookmark lists) gets one, with a unit test in `tests/unit/`. A new user-facing flow gets a line in `tests/e2e/`.
6. **Check before you push.** `npm run verify` (and the cargo commands if you changed Rust). Fix what it reports; don't skip or disable a check to get green.
7. **Commit small, clear steps.** Conventional style: `feat: tie ribbons from the page label`, `fix: ribbons flicker on fast turns`.
8. **Open a pull request.** Fill in the template. CI runs the same checks on Windows, macOS and Linux.
9. **Review, then squash-merge.** At least one review; the PR must be green.

## 3. Commands

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | Web UI with hot reload at http://localhost:1420                     |
| `npm run app:dev`      | Desktop window around the dev server                                |
| `npm run check`        | Svelte + TypeScript type check (warnings fail it)                   |
| `npm run lint`         | ESLint                                                              |
| `npm run format`       | Prettier, writes changes                                            |
| `npm test`             | Unit tests (Vitest)                                                 |
| `npm run test:e2e`     | Browser tests (Playwright) against the built app                    |
| `npm run verify`       | Format check, lint, type check, unit tests and build, in that order |
| `npm run app:portable` | Release `.exe` / binary without an installer                        |
| `npm run app:build`    | Release installers for this system                                  |

Rust, from `src-tauri/`: `cargo fmt`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.

## 4. Definition of done

A change is done when:

- It works in `npm run app:dev` on at least one desktop system, and in the browser if it's UI.
- `npm run verify`, `npm run test:e2e` and the cargo checks pass.
- New logic has unit tests; new flows have an e2e line.
- It uses design tokens and components, with no raw colours or radii in components.
- It respects reduced motion (animations check `reduceMotion` or rely on motion.css).
- Docs are updated if you changed structure, commands or the design system.

## 5. Releasing

1. Bump the version in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json` (keep them equal).
2. Note the changes in the PR description.
3. Merge to main, then tag: `git tag v0.2.0 && git push origin v0.2.0`.
4. The **Release** workflow builds:
   - Windows: `Paper-Book-<version>-windows-portable.zip` (the `.exe` plus an empty `PaperBookData/` folder) and the setup `.exe`.
   - macOS `.dmg`, Linux `.AppImage` and `.deb`.
     It attaches them to a draft GitHub release. Check the draft, then publish it.

Unsigned builds show a SmartScreen warning on Windows and need right-click → Open on macOS. Code signing is a roadmap item.

## 6. Debugging tips

- **Desktop dev tools:** in `npm run app:dev`, right-click → Inspect (debug builds only).
- **Saved data:** desktop data is one file, `paper-book.json`, in `PaperBookData/` (portable) or the app data folder. In the browser it's `localStorage` keys starting with `pb:`.
- **Page turn shape:** `src/engine/pageCurl.ts` is a pure function with tests; change it there and watch `tests/unit/pageCurl.test.ts`.
- **WebGL in CI/headless:** Playwright launches Chromium with SwiftShader so the book renders without a GPU.
