/**
 * Reading-room scenes. Each sets the backdrop and how it lights the book:
 * `tint` multiplies page colour, `shadow` is the book's shadow strength, `light` the default light side.
 */
export interface Scene {
  id: string;
  name: string;
  /** CSS background for the room. */
  bg: string;
  /** Which drawing from sceneArt.ts sits on top ("" for none). */
  art: "desk" | "sea" | "pastel" | "night" | "";
  tint: [number, number, number];
  shadow: number;
  light: -1 | 0 | 1;
  /** CSS background for the picker tile. */
  thumb: string;
}

export const SCENES: readonly Scene[] = [
  {
    id: "desk",
    name: "Sketch desk",
    bg: "#b8895a",
    art: "desk",
    tint: [1.0, 0.97, 0.9],
    shadow: 0.5,
    light: -1,
    thumb: "linear-gradient(160deg,#c99a68,#a8784a)",
  },
  {
    id: "sea",
    name: "Seaside dusk",
    bg: "linear-gradient(180deg,#eebfa9 0%,#f3cbb8 48%,#e2cfc6 59.6%,#7f9190 60%,#5d7170 100%)",
    art: "sea",
    tint: [1.0, 0.95, 0.93],
    shadow: 0.32,
    light: 0,
    thumb: "linear-gradient(180deg,#eebfa9 0 58%,#7f9190 58%)",
  },
  {
    id: "pastel",
    name: "Pastel table",
    bg: "linear-gradient(160deg,#f3f3f1,#d9d9d6)",
    art: "pastel",
    tint: [1, 1, 1],
    shadow: 0.26,
    light: -1,
    thumb: "linear-gradient(160deg,#f3f3f1,#d9d9d6)",
  },
  {
    id: "night",
    name: "Night window",
    bg: "radial-gradient(ellipse 60% 70% at 50% 40%,#33406b,#151b33 70%,#0b0f1f)",
    art: "night",
    tint: [0.86, 0.88, 1.0],
    shadow: 0.6,
    light: 1,
    thumb: "radial-gradient(circle at 70% 30%,#f4e7b5 0 5px,#1b2350 6px)",
  },
  {
    id: "wall",
    name: "Your wallpaper",
    bg: "#3a4448",
    art: "",
    tint: [1, 1, 1],
    shadow: 0.45,
    light: -1,
    thumb: "linear-gradient(135deg,#c9b79c,#7a8c84)",
  },
];

export const sceneById = (id: string): Scene => SCENES.find((s) => s.id === id) ?? SCENES[0];
