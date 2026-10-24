import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { KeyValueStore, PickedFile, Platform } from "./types";

/**
 * Desktop storage: one JSON file kept by the Rust core (src-tauri/src/storage.rs).
 * Next to the .exe in PaperBookData/ when run from a USB stick, otherwise the app data folder.
 * Reads come from memory; writes are batched and saved shortly after the last change.
 */
function fileStore(): KeyValueStore & { load(): Promise<void>; where: string } {
  let data: Record<string, unknown> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => invoke("storage_save", { data: JSON.stringify(data) }).catch(console.error);
  addEventListener("beforeunload", () => {
    if (timer) flush();
  });
  return {
    where: "",
    async load() {
      const res = await invoke<{ data: string; location: string }>("storage_load");
      this.where = res.location;
      try {
        data = JSON.parse(res.data || "{}");
      } catch {
        data = {};
      }
    },
    get(key, fallback) {
      return key in data ? (data[key] as typeof fallback) : fallback;
    },
    set(key, value) {
      data[key] = value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        flush();
      }, 400);
    },
  };
}

export function desktopPlatform(): Platform {
  const storage = fileStore();
  const platform: Platform = {
    kind: "desktop",
    storageNote: "Bookmarks are saved in the app's data folder.",
    storage,
    async init() {
      await storage.load();
      platform.storageNote = `Bookmarks are saved in ${storage.where}.`;
    },
    async pickPdf(): Promise<PickedFile | null> {
      const picked = await invoke<{ path: string; name: string } | null>("pick_pdf");
      if (!picked) return null;
      const buf = await invoke<ArrayBuffer>("read_pdf", { path: picked.path });
      return { name: picked.name, bytes: new Uint8Array(buf) };
    },
    async toggleFullscreen() {
      const w = getCurrentWindow();
      await w.setFullscreen(!(await w.isFullscreen()));
    },
  };
  return platform;
}
