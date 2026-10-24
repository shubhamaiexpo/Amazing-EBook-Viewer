import type { KeyValueStore, PickedFile, Platform } from "./types";

/** Browser storage: one localStorage entry per key, JSON encoded. */
export function localStore(prefix = "pb:", backend: Storage | undefined = globalThis.localStorage): KeyValueStore {
  return {
    get(key, fallback) {
      try {
        const v = backend?.getItem(prefix + key);
        return v == null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        backend?.setItem(prefix + key, JSON.stringify(value));
      } catch {
        /* full or blocked storage: keep reading, just don't remember */
      }
    },
  };
}

function pickWithInput(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export function webPlatform(): Platform {
  return {
    kind: "web",
    storageNote: "Bookmarks are saved for this PDF in this browser.",
    storage: localStore(),
    async init() {},
    async pickPdf(): Promise<PickedFile | null> {
      const f = await pickWithInput("application/pdf,.pdf");
      return f ? { name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) } : null;
    },
    async toggleFullscreen() {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    },
  };
}
