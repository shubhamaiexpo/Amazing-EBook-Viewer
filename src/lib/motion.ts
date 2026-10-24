/** True when the person has asked their system for less motion. Every animation checks this. */
export const reduceMotion: boolean =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth in-and-out curve used for page turns. */
export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Frame-rate independent smoothing factor: move this fraction of the way to the target this frame. */
export const damp = (dt: number, rate: number): number => 1 - Math.exp(-dt * rate);
