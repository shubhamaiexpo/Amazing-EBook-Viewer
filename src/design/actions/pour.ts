import { lastPress } from "$lib/pointer";
import { reduceMotion } from "$lib/motion";

/**
 * Svelte transition: a panel floods in from where the person pressed, wobbling slightly before it settles.
 *
 *   <section in:pour out:fade={{ duration: 120 }}>
 */
export function pour(node: HTMLElement) {
  if (reduceMotion) return { duration: 0 };
  const r = node.getBoundingClientRect(),
    cx = lastPress.x - r.left,
    cy = lastPress.y - r.top;
  const far = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
  return {
    duration: 620,
    css: (t: number) => {
      const e = 1 - Math.pow(1 - t, 3);
      const s = t < 0.6 ? 0.97 + (0.04 * t) / 0.6 : 1.01 - (0.01 * (t - 0.6)) / 0.4;
      return `clip-path: circle(${(far * e).toFixed(1)}px at ${cx}px ${cy}px); transform: scale(${s.toFixed(4)});`;
    },
  };
}
