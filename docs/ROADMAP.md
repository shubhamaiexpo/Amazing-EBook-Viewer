# Roadmap

Each milestone ends with something people can use. Dates are set when a milestone starts.

## M0 · Foundation ✅

Project structure, design system, the reader ported from the prototype, Rust core with portable storage, tests (unit, browser, Rust), CI and release workflows.

## M1 · First Windows release (v0.1)

- [ ] Create the GitHub repository and push; turn on CI.
- [ ] Test the portable `.exe` on Windows 10 and 11, from a USB stick and from a normal folder.
- [ ] Reopen the last book on launch (remember its path, ask again if it moved).
- [ ] Recent books list on an empty start screen.
- [ ] Open a PDF by double-clicking it or dragging it onto the `.exe` (file associations).
- [ ] Large PDFs: render pages on demand without stalls (measure with a 300-page book).
- [ ] Publish v0.1 as a GitHub release.

## M2 · Reading comfort (v0.2)

- [ ] Single-page mode for portrait windows and very wide pages.
- [ ] Page thumbnails strip for quick jumps.
- [ ] Table of contents from the PDF outline.
- [ ] Bookmarks export/import (JSON) so they can move between computers.
- [ ] Settings panel: default scene, sound volume, animation speed.

## M3 · macOS and Linux (v0.3)

- [ ] Test builds on macOS (Apple silicon and Intel) and Ubuntu.
- [ ] Code signing: Windows (Authenticode) and macOS (Developer ID + notarisation).
- [ ] Auto-update through the Tauri updater (opt-in for the portable build).

## M4 · Phones and tablets (v0.5)

- [ ] Tauri 2 mobile targets (Android first, then iOS).
- [ ] Touch-first layout: dock at the bottom, swipe to turn, pinch for the magnifier.
- [ ] Opening books from the device's files.

## Ideas parking lot

Read-aloud with page following, night-light warmth on a timer, sticker bookmarks, sharing a ribbon as an image.
