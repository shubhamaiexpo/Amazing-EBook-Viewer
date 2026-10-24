import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEMES, themeById } from "$design/themes";
import { mix } from "$lib/color";
import { SCENES } from "$features/scenes/scenes";
import { COLLECTIONS } from "$features/bookmarks/collections";

const HEX = /^#[0-9a-f]{6}$/i;

describe("themes", () => {
  it("define every semantic colour as hex", () => {
    for (const t of THEMES)
      for (const k of ["ink", "inkSoft", "accent", "accentSoft", "action"] as const) expect(t[k]).toMatch(HEX);
  });
  it("have unique ids and fall back to the first", () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    expect(themeById("nope").id).toBe("sunny");
  });
  it("only override tokens that tokens.css registers", () => {
    const css = readFileSync("src/design/tokens.css", "utf8");
    for (const v of ["--ink", "--ink-soft", "--accent", "--accent-soft", "--action"])
      expect(css).toContain(`@property ${v}`);
  });
});

describe("data tables", () => {
  it("scenes and collections have unique ids", () => {
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length);
    expect(new Set(COLLECTIONS.map((c) => c.id)).size).toBe(COLLECTIONS.length);
  });
});

describe("mix", () => {
  it("blends between colours", () => {
    expect(mix("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mix("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});
