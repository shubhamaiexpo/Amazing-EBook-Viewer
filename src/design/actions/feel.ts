import { bloop } from "$lib/sound";
import { reduceMotion } from "$lib/motion";

/** App-wide switches for how controls feel. App.svelte keeps `sound` in step with settings. */
export const feelConfig = { sound: false };

export interface FeelOptions {
  /** Lean toward the mouse pointer (dock buttons, arrows, close buttons). */
  magnetic?: boolean;
}

/**
 * Gives a control physical feedback:
 * a jelly squash when released, a pop ring when it switches on, an optional magnetic lean,
 * a soft bloop (if page sound is on) and a tiny buzz on touch screens.
 *
 *   <button use:feel={{ magnetic: true }}>
 */
export function feel(node: HTMLElement, opts: FeelOptions = {}) {
  if (reduceMotion) return {};
  let options = opts;
  const on = () => node.getAttribute("aria-pressed") === "true" || node.getAttribute("aria-checked") === "true";

  const move = (e: PointerEvent) => {
    if (!options.magnetic || e.pointerType !== "mouse" || (node as HTMLButtonElement).disabled) return;
    const r = node.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width,
      dy = (e.clientY - r.top - r.height / 2) / r.height;
    node.style.translate = `${(dx * 7).toFixed(1)}px ${(dy * 6).toFixed(1)}px`;
  };
  const leave = () => (node.style.translate = "");
  const up = (e: PointerEvent) => {
    if ((node as HTMLButtonElement).disabled) return;
    node.classList.remove("pb-boing", "pb-popped");
    void node.offsetWidth; // restart the animation
    // aria-pressed flips in the click handler, which runs after pointerup, so look a moment later
    setTimeout(() => {
      node.classList.add(on() ? "pb-popped" : "pb-boing");
      setTimeout(() => node.classList.remove("pb-boing", "pb-popped"), 720);
      bloop(feelConfig.sound, on() ? 1.25 : 1);
    }, 0);
    if (e.pointerType === "touch") navigator.vibrate?.(8);
  };

  node.addEventListener("pointermove", move);
  node.addEventListener("pointerleave", leave);
  node.addEventListener("pointerup", up);
  return {
    update(next: FeelOptions = {}) {
      options = next;
    },
    destroy() {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerup", up);
    },
  };
}
