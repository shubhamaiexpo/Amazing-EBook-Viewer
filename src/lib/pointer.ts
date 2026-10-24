/**
 * Where the person last pressed. Panels pour open from here and theme ripples start here.
 * Captured once for the whole app so components don't each need their own listener.
 */
export const lastPress = { x: 0, y: 60 };

export function trackPresses(): void {
  lastPress.x = innerWidth / 2;
  addEventListener(
    "pointerdown",
    (e) => {
      lastPress.x = e.clientX;
      lastPress.y = e.clientY;
    },
    true,
  );
}
