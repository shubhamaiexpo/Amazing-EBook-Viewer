import { reduceMotion } from "$lib/motion";

/**
 * Colour themes. Each one sets the five semantic colour tokens from tokens.css.
 * To add a theme, add a row here; nothing else needs to change.
 */
export interface Theme {
  id: string;
  name: string;
  ink: string; // --ink
  inkSoft: string; // --ink-soft
  accent: string; // --accent
  accentSoft: string; // --accent-soft
  action: string; // --action
}

export const THEMES: readonly Theme[] = [
  {
    id: "sunny",
    name: "Sunny",
    ink: "#2f2f2f",
    inkSoft: "#6a6a6a",
    accent: "#ffc928",
    accentSoft: "#ffe48a",
    action: "#19acd6",
  },
  {
    id: "coral",
    name: "Coral",
    ink: "#23264a",
    inkSoft: "#5e6182",
    accent: "#ff8a65",
    accentSoft: "#ffc2ad",
    action: "#22a68f",
  },
  {
    id: "mint",
    name: "Mint",
    ink: "#1f3b33",
    inkSoft: "#5b7069",
    accent: "#7fe0b4",
    accentSoft: "#c4f2dc",
    action: "#6c5ce7",
  },
  {
    id: "berry",
    name: "Berry",
    ink: "#3a1f3d",
    inkSoft: "#7a6280",
    accent: "#ffb3c7",
    accentSoft: "#ffd9e3",
    action: "#8e5cf7",
  },
  {
    id: "sea",
    name: "Deep sea",
    ink: "#0f2a3d",
    inkSoft: "#557085",
    accent: "#9fd8ff",
    accentSoft: "#d3edff",
    action: "#ff7a45",
  },
  {
    id: "sand",
    name: "Sand",
    ink: "#3b2f22",
    inkSoft: "#7d6d5a",
    accent: "#f2c98a",
    accentSoft: "#f8e3c2",
    action: "#4f8a5b",
  },
];

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0];

function paint(t: Theme, root: HTMLElement): void {
  const st = root.style;
  st.setProperty("--ink", t.ink);
  st.setProperty("--ink-soft", t.inkSoft);
  st.setProperty("--accent", t.accent);
  st.setProperty("--accent-soft", t.accentSoft);
  st.setProperty("--action", t.action);
}

let glideTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Apply a theme. With `from`, colours glide across and rings of the new colours spread out from
 * that point like a drop in still water. Without it (first paint), the theme is applied at once.
 */
export function applyTheme(id: string, from?: { x: number; y: number }): void {
  const t = themeById(id),
    root = document.documentElement;
  if (!from || reduceMotion) return paint(t, root);
  root.classList.add("theming");
  paint(t, root);
  clearTimeout(glideTimer);
  glideTimer = setTimeout(() => root.classList.remove("theming"), 800);
  tide(from.x, from.y, [
    [t.accent, 0, 7],
    [t.action, 140, 4],
    [t.accentSoft, 280, 10],
  ]);
}

/** Rings drawn on one canvas, so the effect stays smooth even on slow machines. */
function tide(cx: number, cy: number, rings: [color: string, delay: number, width: number][]): void {
  document.querySelector(".pb-tide")?.remove();
  const cv = document.createElement("canvas");
  cv.className = "pb-tide";
  Object.assign(cv.style, {
    position: "fixed",
    left: "0",
    top: "0",
    pointerEvents: "none",
    zIndex: "var(--z-effects)",
  });
  const dpr = Math.min(devicePixelRatio || 1, 1.5),
    W = innerWidth,
    H = innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  cv.style.width = W + "px";
  cv.style.height = H + "px";
  document.body.appendChild(cv);
  const g = cv.getContext("2d");
  if (!g) return cv.remove();
  g.scale(dpr, dpr);
  const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)),
    t0 = performance.now(),
    dur = 1100;
  const step = (now: number) => {
    g.clearRect(0, 0, W, H);
    let alive = false;
    for (const [c, delay, w] of rings) {
      const k = (now - t0 - delay) / dur;
      if (k < 0) {
        alive = true;
        continue;
      }
      if (k >= 1) continue;
      alive = true;
      const e = 1 - Math.pow(1 - k, 3);
      g.globalAlpha = (1 - k) * 0.9;
      g.strokeStyle = c;
      g.lineWidth = w * (1 - k * 0.5);
      g.beginPath();
      g.arc(cx, cy, 8 + e * R, 0, Math.PI * 2);
      g.stroke();
    }
    if (alive) requestAnimationFrame(step);
    else cv.remove();
  };
  requestAnimationFrame(step);
}
