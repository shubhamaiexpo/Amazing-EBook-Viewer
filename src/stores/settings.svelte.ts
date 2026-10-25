import { storage } from "$platform/index";

export type WatchStyle = "classic" | "pocket" | "digital" | "smart";
export type RibbonStyle = "satin" | "tab" | "tassel";
export type WallFit = "cover" | "contain" | "tile";

export interface Settings {
  watch: WatchStyle;
  ribbon: RibbonStyle;
  theme: string;
  scene: string;
  /** Where the light comes from: -1 left, 0 above, 1 right. null = the scene decides. */
  light: -1 | 0 | 1 | null;
  /** Keep the scene's tint off the pages. */
  trueColour: boolean;
  sound: boolean;
  /** Shadow strength: 0 = none, 1 = as the scene sets it, 2 = darkest. */
  shadow: number;
  fit: WallFit;
  blur: number;
  dim: number;
}

export const DEFAULT_SETTINGS: Settings = {
  watch: "classic",
  ribbon: "satin",
  theme: "sunny",
  scene: "desk",
  light: null,
  trueColour: false,
  sound: false,
  shadow: 1,
  fit: "cover",
  blur: 0,
  dim: 10,
};

/** App-wide preferences. Read and assign fields directly; changes are saved automatically. */
export const settings: Settings = $state({ ...DEFAULT_SETTINGS });

/** The person's own wallpaper, as a downscaled data URL. Kept apart from settings because it is large. */
export const wallpaper = $state<{ url: string | null }>({ url: null });

export function loadSettings(): void {
  Object.assign(settings, DEFAULT_SETTINGS, storage.get<Partial<Settings>>("settings", {}));
  wallpaper.url = storage.get<string | null>("wallpaper", null);
  $effect.root(() => {
    $effect(() => storage.set("settings", $state.snapshot(settings)));
    $effect(() => storage.set("wallpaper", wallpaper.url));
  });
}
