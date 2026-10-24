/**
 * Everything the app needs from the machine it runs on. The rest of the code talks only to this
 * interface, so the same UI runs in a browser tab (web.ts) and in the desktop shell (desktop.ts).
 */
export interface KeyValueStore {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
}

export interface PickedFile {
  name: string;
  bytes: Uint8Array;
}

export interface Platform {
  kind: "web" | "desktop";
  /** Where saved data lives, in words the person understands. */
  storageNote: string;
  storage: KeyValueStore;
  /** Load saved data before the UI starts. */
  init(): Promise<void>;
  /** Ask the person for a PDF. Resolves null if they cancel. */
  pickPdf(): Promise<PickedFile | null>;
  toggleFullscreen(): Promise<void>;
}
