/**
 * Every icon in the app: 24×24 stroke paths. Add one here and use it by name: <Icon name="bookmark" />.
 * Keep strokes simple; Icon.svelte sets the stroke width and round caps.
 */
export const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  bookmark: '<path d="M7 3h10v18l-5-4-5 4z"/>',
  magnifier: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 10.5h5M10.5 8v5"/>',
  list: '<path d="M5 6h14M5 12h14M5 18h9"/>',
  scene: '<path d="M3 17l5-6 4 4 3-3 6 5"/><circle cx="16" cy="7" r="2"/>',
  fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  prev: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
} as const;

export type IconName = keyof typeof ICONS;

/** Hover micro-animations from motion.css: the icon acts out what its button does. */
export type IconAct = "drop" | "wiggle" | "rise" | "grow" | "shimmy" | "spin";
