import type { RibbonStyle } from "$engine/ribbonArt";

/** Bookmark collections. Each has its own ribbon colour. Add a row to add a collection. */
export interface Collection {
  id: string;
  name: string;
  color: string;
}

export const COLLECTIONS: readonly Collection[] = [
  { id: "fav", name: "Favourite", color: "#e0453a" },
  { id: "aloud", name: "Read aloud", color: "#3fa3dc" },
  { id: "back", name: "Come back", color: "#2b2a28" },
  { id: "learn", name: "Learn", color: "#3c9a5f" },
  { id: "fun", name: "Funny bit", color: "#f0a531" },
];

export const collectionById = (id: string): Collection => COLLECTIONS.find((c) => c.id === id) ?? COLLECTIONS[0];

export const RIBBON_STYLES: readonly { id: RibbonStyle; name: string }[] = [
  { id: "satin", name: "Satin" },
  { id: "tab", name: "Page tab" },
  { id: "tassel", name: "Tassel" },
];
