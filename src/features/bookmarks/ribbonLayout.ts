import type { RibbonSpec } from "$engine/BookRenderer";
import { spreadPages } from "$features/reader/spreads";
import { collectionById } from "./collections";
import type { Bookmark } from "./bookmarks.svelte";

/** How many tucked ribbons to show on each side of the open spread. */
export const TUCKED_PER_SIDE = 4;

/**
 * Each bookmark keeps its own spot along the top edge, so ribbons never shuffle as you read.
 * Returns 0.2..0.82 of the way from the spine to the outer edge (golden-ratio spacing avoids clumps).
 */
export function ribbonSlot(page: number): number {
  const f = (page * 0.6180339887 + 0.13) % 1;
  return 0.2 + f * 0.62;
}

/**
 * Which ribbons to draw for the open spread, and where.
 * A ribbon whose page is open lies across that page. The nearest few before the spread peek out on the
 * left, the nearest few after it on the right; the rest stay hidden so the top edge never gets crowded.
 */
export function ribbonsFor(bookmarks: readonly Bookmark[], spread: number, pageCount: number): RibbonSpec[] {
  if (!pageCount) return [];
  const [sl, sr] = spreadPages(spread, pageCount),
    first = sl >= 0 ? sl : sr,
    last = sr >= 0 ? sr : sl;
  const behind = bookmarks.filter((b) => b.page < first).slice(-TUCKED_PER_SIDE);
  const ahead = bookmarks.filter((b) => b.page > last).slice(0, TUCKED_PER_SIDE);
  const out: RibbonSpec[] = [];
  for (const b of bookmarks) {
    const here = b.page === sl || b.page === sr;
    if (!here && !behind.includes(b) && !ahead.includes(b)) continue;
    const right = here ? b.page === sr : b.page > last;
    out.push({
      key: b.page + ":" + b.coll,
      here,
      x: (right ? 1 : -1) * ribbonSlot(b.page),
      color: collectionById(b.coll).color,
      page: b.page,
      label: b.label,
    });
  }
  return out;
}
