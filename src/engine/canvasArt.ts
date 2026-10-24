/** 2D canvas drawings the book is textured with. No Three.js here, so they're easy to tweak and test. */

export const PAPER = "#f7f2e6";

/**
 * A page drawn onto paper, with its two outer corners rounded and a gentle shade along the spine.
 * `outerRight`: the page's outer edge is on the right (a right-hand page).
 */
export function roundedPageCanvas(
  src: CanvasImageSource | null,
  w: number,
  h: number,
  outerRight: boolean,
  paper = PAPER,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const r = Math.round(w * 0.05);
  g.beginPath();
  if (outerRight) {
    g.moveTo(0, 0);
    g.lineTo(w - r, 0);
    g.quadraticCurveTo(w, 0, w, r);
    g.lineTo(w, h - r);
    g.quadraticCurveTo(w, h, w - r, h);
    g.lineTo(0, h);
  } else {
    g.moveTo(w, 0);
    g.lineTo(r, 0);
    g.quadraticCurveTo(0, 0, 0, r);
    g.lineTo(0, h - r);
    g.quadraticCurveTo(0, h, r, h);
    g.lineTo(w, h);
  }
  g.closePath();
  g.save();
  g.clip();
  g.fillStyle = paper;
  g.fillRect(0, 0, w, h);
  if (src) g.drawImage(src, 0, 0, w, h);
  const sx = outerRight ? 0 : w,
    grd = g.createLinearGradient(sx, 0, outerRight ? w * 0.12 : w * 0.88, 0);
  grd.addColorStop(0, "rgba(70,50,20,.16)");
  grd.addColorStop(1, "rgba(70,50,20,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  g.restore();
  return c;
}

/** The soft shadow the whole book casts on the scene. */
export function bookShadowCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.filter = "blur(18px)";
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(40, 36, 176, 120, 14);
  g.fill();
  return c;
}

/** Paper tones for the fanned sheets behind each page. */
export const STACK_TONES = ["#efe6cf", "#f3ebd9", "#e9dfc6", "#f1e9d6", "#ebe1c9"];
