import { storage } from "$platform/index";

export interface Bookmark {
  /** 0-based page index. */
  page: number;
  label: string;
  /** Collection id from collections.ts. */
  coll: string;
  /** When it was made (ms since epoch). */
  at: number;
}

/** Pure list operations, kept apart from storage so they're easy to test. */
export function withBookmark(list: readonly Bookmark[], b: Bookmark): Bookmark[] {
  return [...list.filter((x) => x.page !== b.page), b].sort((a, z) => a.page - z.page);
}
export function withoutBookmark(list: readonly Bookmark[], page: number): Bookmark[] {
  return list.filter((x) => x.page !== page);
}

/** Bookmarks for the open PDF, saved per document. */
class Bookmarks {
  items = $state<Bookmark[]>([]);
  /** The collection new ribbons go into. */
  collection = $state("fav");
  private docId = "";

  load(docId: string): void {
    this.docId = docId;
    this.items = docId ? storage.get<Bookmark[]>("bm:" + docId, []) : [];
  }

  private save(): void {
    if (this.docId) storage.set("bm:" + this.docId, $state.snapshot(this.items));
  }

  add(page: number, label: string, coll = this.collection): void {
    this.items = withBookmark(this.items, { page, label: label || `Page ${page + 1}`, coll, at: Date.now() });
    this.save();
  }

  remove(page: number): void {
    this.items = withoutBookmark(this.items, page);
    this.save();
  }
}

export const bookmarks = new Bookmarks();
