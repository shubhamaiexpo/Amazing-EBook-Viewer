/**
 * How pages pair up into spreads, as pure functions.
 * Spread 0 is the cover alone on the right. After that, spread s shows pages 2s-1 (left) and 2s (right).
 * Page indexes are 0-based; -1 means "no page on that side".
 */
export type Spread = [left: number, right: number];

export function spreadPages(spread: number, pageCount: number): Spread {
  if (spread === 0) return [-1, 0];
  return [2 * spread - 1, 2 * spread <= pageCount - 1 ? 2 * spread : -1];
}

export const lastSpread = (pageCount: number): number => Math.floor(pageCount / 2);

/** The spread that shows page `page`. */
export const spreadOf = (page: number): number => (page <= 0 ? 0 : Math.ceil(page / 2));

/** The page a bookmark should mark: the right-hand page if there is one. */
export function currentPage(spread: number, pageCount: number): number {
  const [l, r] = spreadPages(spread, pageCount);
  return r >= 0 ? r : l;
}

/** "Pages 2–3 of 12" or "Page 1 of 12". */
export function spreadLabel(spread: number, pageCount: number): string {
  const pages = spreadPages(spread, pageCount)
    .filter((i) => i >= 0)
    .map((i) => i + 1);
  return pages.length === 2 ? `Pages ${pages[0]}–${pages[1]} of ${pageCount}` : `Page ${pages[0]} of ${pageCount}`;
}

/** Pages worth keeping rendered around the open spread. */
export function nearbyPages(spread: number, pageCount: number, reach = 6): Set<number> {
  const [a, b] = spreadPages(spread, pageCount);
  const keep = new Set<number>();
  for (let i = Math.max(0, a - reach); i <= Math.min(pageCount - 1, Math.max(a, b) + reach); i++) keep.add(i);
  return keep;
}
