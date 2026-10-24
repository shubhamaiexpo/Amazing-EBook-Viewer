import { describe, expect, it } from "vitest";
import { withBookmark, withoutBookmark, type Bookmark } from "$features/bookmarks/bookmarks.svelte";

const bm = (page: number, label = ""): Bookmark => ({ page, label, coll: "fav", at: 0 });

describe("bookmark list", () => {
  it("keeps bookmarks sorted by page", () => {
    const list = withBookmark(withBookmark([bm(5)], bm(1)), bm(3));
    expect(list.map((b) => b.page)).toEqual([1, 3, 5]);
  });

  it("replaces the bookmark on the same page", () => {
    const list = withBookmark([bm(2, "old")], bm(2, "new"));
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe("new");
  });

  it("removes by page", () => {
    expect(withoutBookmark([bm(1), bm(2)], 1).map((b) => b.page)).toEqual([2]);
  });
});
