import { reduceMotion } from "$lib/motion";

/**
 * Water drop where you press: a soft fill and two rings spreading from the pointer.
 * The element needs `position: relative; overflow: hidden` (all design-system controls have it).
 */
export function ripple(node: HTMLElement) {
  if (reduceMotion) return {};
  const down = (e: PointerEvent) => {
    const r = node.getBoundingClientRect(),
      size = Math.hypot(r.width, r.height) * 2.2;
    for (const [cls, delay] of [
      ["fill", 0],
      ["", 0],
      ["", 140],
    ] as const) {
      const d = document.createElement("span");
      d.className = "pb-ripple " + cls;
      Object.assign(d.style, {
        left: e.clientX - r.left + "px",
        top: e.clientY - r.top + "px",
        width: size + "px",
        height: size + "px",
        animationDelay: delay + "ms",
      });
      node.appendChild(d);
      setTimeout(() => d.remove(), 1000 + delay);
    }
  };
  node.addEventListener("pointerdown", down);
  return { destroy: () => node.removeEventListener("pointerdown", down) };
}
