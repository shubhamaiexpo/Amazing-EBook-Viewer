import { describe, expect, it } from "vitest";
import type { Bookmark } from "$features/bookmarks/bookmarks.svelte";
import { ribbonsFor, ribbonSlot, TUCKED_PER_SIDE } from "$features/bookmarks/ribbonLayout";

const bm = (page: number, coll = "fav"): Bookmark => ({ page, label: "", coll, at: 0 });

describe("ribbonSlot", () => {
  it("is fixed per page and stays inside the top edge", () => {
    for (let p = 0; p < 200; p++) {
      const s = ribbonSlot(p);
      expect(s).toBeGreaterThanOrEqual(0.2);
      expect(s).toBeLessThanOrEqual(0.82);
      expect(ribbonSlot(p)).toBe(s);
    }
  });
});

describe("ribbonsFor", () => {
  it("lays a ribbon across an open page, on its own side", () => {
    const [left, right] = ribbonsFor([bm(3), bm(4)], 2, 11);
    expect(left).toMatchObject({ page: 3, here: true });
    expect(left.x).toBeLessThan(0);
    expect(right).toMatchObject({ page: 4, here: true });
    expect(right.x).toBeGreaterThan(0);
  });

  it("tucks earlier pages on the left and later pages on the right", () => {
    const list = ribbonsFor([bm(1), bm(9)], 2, 11);
    expect(list.find((r) => r.page === 1)).toMatchObject({ here: false });
    expect(list.find((r) => r.page === 1)!.x).toBeLessThan(0);
    expect(list.find((r) => r.page === 9)!.x).toBeGreaterThan(0);
  });

  it("shows only the nearest few tucked ribbons each side", () => {
    const many = Array.from({ length: 30 }, (_, i) => bm(i));
    const list = ribbonsFor(many, 10, 40); // pages 19–20 open
    const before = list.filter((r) => r.page < 19),
      after = list.filter((r) => r.page > 20);
    expect(before.map((r) => r.page)).toEqual([15, 16, 17, 18]);
    expect(after.map((r) => r.page)).toEqual([21, 22, 23, 24]);
    expect(before.length).toBe(TUCKED_PER_SIDE);
  });

  it("colours ribbons by collection", () => {
    expect(ribbonsFor([bm(0, "aloud")], 0, 5)[0].color).toBe("#3fa3dc");
  });

  it("draws nothing without a book", () => {
    expect(ribbonsFor([bm(0)], 0, 0)).toEqual([]);
  });
});
