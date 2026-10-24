import { describe, expect, it } from "vitest";
import { localStore } from "$platform/web";

describe("localStore", () => {
  it("round-trips JSON values under a prefix", () => {
    const s = localStore("t:");
    s.set("a", { x: 1 });
    expect(s.get("a", null)).toEqual({ x: 1 });
    expect(localStorage.getItem("t:a")).toBe('{"x":1}');
  });
  it("returns the fallback for missing or broken values", () => {
    const s = localStore("t:");
    expect(s.get("missing", 7)).toBe(7);
    localStorage.setItem("t:bad", "{oops");
    expect(s.get("bad", "fallback")).toBe("fallback");
  });
});
