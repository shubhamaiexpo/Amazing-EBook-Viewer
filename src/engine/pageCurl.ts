/**
 * The page-turn shape, as a pure function so it can be tested without WebGL.
 *
 * The page is hinged at the spine (u = 0) and bends as it turns, so it never comes loose from the book.
 * Think of the page as an arc: the spine end sits at angle a0, the outer edge at a1, and the arc in between
 * curves smoothly. Mid-turn the outer edge runs ahead of the spine, giving the soft bow of real paper.
 */

/** How far the soft page sweeps up off the book. 1 would stand it upright; real paper sags lower. */
export const CURL_HEIGHT = 0.62;

export interface CurlInput {
  /** Flat grid positions: x in [-0.5, 0.5], y in [-0.5, 0.5], z = 0 (three's PlaneGeometry layout). */
  base: ArrayLike<number>;
  /** Written in place: xyz per vertex. */
  out: { [i: number]: number; length: number };
  /** Page width and height in world units. */
  W: number;
  H: number;
  /** 0 = lying flat on its own side, 1 = landed on the other side. */
  t: number;
  /** -1..1: which corner leads the turn (the one you grabbed). */
  lean: number;
  /** 1 = turning forward (right page going left), -1 = backward. */
  dir: 1 | -1;
}

/** Bends every vertex for progress t. Returns the x of the outer edge's middle, for the cast shadow. */
export function curlPage({ base, out, W, H, t, lean, dir }: CurlInput): number {
  t = Math.max(0, Math.min(1, t));
  const lift = Math.sin(Math.PI * t);
  const bend = 0.55 * lift; // how much the outer edge runs ahead of the spine
  const a0 = Math.PI * Math.max(0, t - bend * 0.5); // angle at the spine
  const a1 = Math.PI * Math.min(1, t + bend * 0.5); // angle at the outer edge
  let edgeX = 0;
  const count = base.length / 3;
  for (let i = 0; i < count; i++) {
    const u = (base[i * 3] + 0.5) * W,
      vn = base[i * 3 + 1];
    // the grabbed corner leads a little more, giving the diagonal curl of a real page
    const lead = Math.PI * 0.16 * lean * vn * lift;
    const e = Math.max(0, Math.min(Math.PI, a1 + lead));
    const c = (e - a0) / W; // curvature along the page
    let x: number, z: number;
    if (Math.abs(c) < 1e-5) {
      x = u * Math.cos(a0);
      z = u * Math.sin(a0);
    } else {
      x = (Math.sin(a0 + c * u) - Math.sin(a0)) / c;
      z = (Math.cos(a0) - Math.cos(a0 + c * u)) / c;
    }
    out[i * 3] = dir * x;
    out[i * 3 + 1] = vn * H;
    out[i * 3 + 2] = z * CURL_HEIGHT + 0.001;
    if (u >= W - 1e-6 && Math.abs(vn) < 0.01) edgeX = x;
  }
  return edgeX;
}
