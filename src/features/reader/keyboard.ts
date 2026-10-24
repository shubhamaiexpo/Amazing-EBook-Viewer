import { bookmarks } from "$features/bookmarks/bookmarks.svelte";
import { closePanels, toast, ui, wake } from "$stores/ui.svelte";
import { reader } from "./reader.svelte";

/**
 * Keyboard shortcuts. Listed here in one place so they're easy to find and change:
 *   → PageDown Space   next spread        ← PageUp Shift+Space   previous spread
 *   Home / End         first / last page  B   bookmark this page
 *   Z                  magnifier          Esc close magnifier or panel
 */
export function quickMark(): void {
  const page = reader.currentPage;
  bookmarks.add(page, "");
  toast(`Ribbon tied on page ${page + 1}`);
}

export function setZoom(on: boolean): void {
  ui.zoom = on;
  if (on) toast("Magnifier on. Scroll to change zoom, Esc to close.");
}

export function handleKey(e: KeyboardEvent): void {
  if ((e.target as HTMLElement | null)?.matches?.("input, textarea")) return;
  wake();
  const k = e.key;
  if (k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey)) {
    e.preventDefault();
    void reader.turn(1);
  } else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)) {
    e.preventDefault();
    void reader.turn(-1);
  } else if (k === "Home") void reader.jumpTo(0);
  else if (k === "End") void reader.jumpTo(reader.pageCount - 1);
  else if (k.toLowerCase() === "b" && reader.hasBook) quickMark();
  else if (k.toLowerCase() === "z") setZoom(!ui.zoom);
  else if (k === "Escape") {
    if (ui.zoom) setZoom(false);
    else closePanels();
  }
}
