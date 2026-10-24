import { desktopPlatform } from "./desktop";
import type { Platform } from "./types";
import { webPlatform } from "./web";

export type { KeyValueStore, PickedFile, Platform } from "./types";

/** The desktop shell injects __TAURI_INTERNALS__ before our code runs. */
export const isDesktop = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const platform: Platform = isDesktop ? desktopPlatform() : webPlatform();
export const storage = platform.storage;
