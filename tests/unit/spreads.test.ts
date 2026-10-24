import { describe, expect, it } from "vitest";
import { currentPage, lastSpread, nearbyPages, spreadLabel, spreadOf, spreadPages } from "$features/reader/spreads";

describe("spreads", () => {
  it("puts the cover alone on the right", () => {
    expect(spreadPages(0, 11)).toEqual([-1, 0]);
  });

  it("pairs pages after the cover", () => {
    expect(spreadPages(1, 11)).toEqual([1, 2]);
    expect(spreadPages(5, 11)).toEqual([9, 10]);
  });

  it("leaves the right side empty after the last page of an even count", () => {
    expect(spreadPages(5, 10)).toEqual([9, -1]);
    expect(lastSpread(10)).toBe(5);
  });

  it("finds the spread for a page", () => {
    expect(spreadOf(0)).toBe(0);
    expect(spreadOf(1)).toBe(1);
    expect(spreadOf(2)).toBe(1);
    expect(spreadOf(3)).toBe(2);
  });

  it("marks the right-hand page when there is one", () => {
    expect(currentPage(0, 11)).toBe(0);
    expect(currentPage(2, 11)).toBe(4);
    expect(currentPage(5, 10)).toBe(9);
  });

  it("labels spreads for people (1-based)", () => {
    expect(spreadLabel(0, 11)).toBe("Page 1 of 11");
    expect(spreadLabel(1, 11)).toBe("Pages 2–3 of 11");
  });

  it("keeps nearby pages within range", () => {
    const keep = nearbyPages(0, 4);
    expect([...keep]).toEqual([0, 1, 2, 3]);
  });
});
