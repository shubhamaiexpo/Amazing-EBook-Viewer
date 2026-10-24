import { describe, expect, it } from "vitest";
import { CURL_HEIGHT, curlPage } from "$engine/pageCurl";

/** A 3×3 grid laid out like three's PlaneGeometry(1, 1, 2, 2). */
function grid(): Float32Array {
  const pts: number[] = [];
  for (const y of [0.5, 0, -0.5]) for (const x of [-0.5, 0, 0.5]) pts.push(x, y, 0);
  return new Float32Array(pts);
}

function run(t: number, dir: 1 | -1 = 1, lean = 0) {
  const base = grid(),
    out = new Float32Array(base.length);
  const edgeX = curlPage({ base, out, W: 1, H: 1.4, t, lean, dir });
  return { out, edgeX };
}

describe("curlPage", () => {
  it("lies flat on its own side at t = 0", () => {
    const { out } = run(0);
    for (let i = 0; i < out.length; i += 3) {
      expect(out[i]).toBeCloseTo((grid()[i] + 0.5) * 1, 5);
      expect(out[i + 2]).toBeCloseTo(0.001, 5);
    }
  });

  it("lands flat on the other side at t = 1", () => {
    const { out } = run(1);
    for (let i = 0; i < out.length; i += 3) {
      expect(out[i]).toBeCloseTo(-(grid()[i] + 0.5), 5);
      expect(Math.abs(out[i + 2] - 0.001)).toBeLessThan(1e-5);
    }
  });

  it("stays hinged at the spine the whole way", () => {
    for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const { out } = run(t, 1, 0.8);
      for (let i = 0; i < out.length; i += 9) {
        // first vertex in each row is at the spine (u = 0)
        expect(out[i]).toBeCloseTo(0, 6);
        expect(out[i + 2]).toBeCloseTo(0.001, 6);
      }
    }
  });

  it("lifts off the book mid-turn, no higher than the curl height", () => {
    const { out } = run(0.5);
    const zs = [...out].filter((_, i) => i % 3 === 2);
    expect(Math.max(...zs)).toBeGreaterThan(0.2);
    expect(Math.max(...zs)).toBeLessThanOrEqual(CURL_HEIGHT + 0.002);
  });

  it("mirrors when turning backward", () => {
    const f = run(0.4, 1).out,
      b = run(0.4, -1).out;
    for (let i = 0; i < f.length; i += 3) expect(b[i]).toBeCloseTo(-f[i], 6);
  });

  it("reports the outer edge position for the cast shadow", () => {
    expect(run(0).edgeX).toBeCloseTo(1, 5);
    expect(run(1).edgeX).toBeCloseTo(-1, 5);
  });
});
