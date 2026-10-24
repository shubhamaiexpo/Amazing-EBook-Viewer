/** Short-lived UI state: which panel is open, the toast, the magnifier, idle chrome. Not saved. */
export type PanelId = "bookmarks" | "scene" | "watch";

export const ui = $state({
  panel: null as PanelId | null,
  toast: "",
  zoom: false,
  idle: false,
  dropping: false,
  /** Set when a request asks the bookmark label field to take focus. */
  focusLabel: 0,
});

export function togglePanel(id: PanelId): void {
  ui.panel = ui.panel === id ? null : id;
}

export function closePanels(): void {
  ui.panel = null;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(message: string): void {
  ui.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (ui.toast = ""), 2600);
}

let idleTimer: ReturnType<typeof setTimeout> | undefined;
/** Any movement shows the controls again; they fade after a few still seconds while reading. */
export function wake(): void {
  ui.idle = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!ui.panel) ui.idle = true;
  }, 2500);
}
