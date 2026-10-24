import * as THREE from "three";
import { mix } from "$lib/color";

/**
 * Bookmark ribbons, painted on a canvas: satin with a swallowtail, a paper tab with the page number,
 * or a cord with a tassel. Each comes with a matching blurred shadow.
 */
export type RibbonStyle = "satin" | "tab" | "tassel";

export interface RibbonArt {
  tex: THREE.CanvasTexture;
  shadow: THREE.CanvasTexture;
  /** Shadow canvas size relative to the ribbon (it has padding for the blur). */
  pad: number;
  padY: number;
  padPx: number;
  chPx: number;
}

/** Canvas size per style, in CSS pixels before the 2× scale. */
const SIZES: Record<RibbonStyle, [number, number]> = { satin: [64, 214], tab: [96, 116], tassel: [96, 240] };

const cache = new Map<string, RibbonArt>();

/** `overFrac`: how much of the ribbon's length lies on the page (the rest hangs above the book). */
export function ribbonArt(color: string, style: RibbonStyle, pageNo: number, overFrac: number): RibbonArt {
  const key = [color, style, style === "tab" ? pageNo : "", overFrac.toFixed(3)].join("|");
  const hit = cache.get(key);
  if (hit) return hit;
  const [cw, ch] = SIZES[style] ?? SIZES.satin;
  const S = 2,
    c = document.createElement("canvas");
  c.width = cw * S;
  c.height = ch * S;
  const g = c.getContext("2d")!;
  g.scale(S, S);
  const foldY = ch * (1 - overFrac); // where it bends over the top edge of the page
  const foldShade = () => {
    const gr = g.createLinearGradient(0, foldY - 14, 0, foldY + 10);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(0.6, "rgba(0,0,0,.28)");
    gr.addColorStop(0.8, "rgba(255,255,255,.18)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, foldY - 14, cw, 24);
  };

  if (style === "tab") {
    const r = 18;
    g.beginPath();
    g.moveTo(4, ch);
    g.lineTo(4, r + 4);
    g.quadraticCurveTo(4, 4, r + 4, 4);
    g.lineTo(cw - r - 4, 4);
    g.quadraticCurveTo(cw - 4, 4, cw - 4, r + 4);
    g.lineTo(cw - 4, ch);
    g.closePath();
    const gr = g.createLinearGradient(0, 0, 0, ch);
    gr.addColorStop(0, mix(color, "#ffffff", 0.22));
    gr.addColorStop(0.5, color);
    gr.addColorStop(1, mix(color, "#000000", 0.15));
    g.fillStyle = gr;
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = "rgba(255,255,255,.35)";
    g.fillRect(10, 8, cw - 20, 3);
    foldShade();
    g.restore();
    g.fillStyle = "#fff";
    g.font = "800 30px Outfit, 'Segoe UI', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,.25)";
    g.shadowBlur = 3;
    g.shadowOffsetY = 1;
    g.fillText(String(pageNo), cw / 2, foldY * 0.52 + 4);
  } else if (style === "tassel") {
    const cx = cw / 2,
      knotY = 88;
    g.lineCap = "round";
    g.strokeStyle = mix(color, "#000000", 0.22);
    g.lineWidth = 14;
    g.beginPath();
    g.moveTo(cx, knotY);
    g.lineTo(cx, ch);
    g.stroke();
    g.strokeStyle = mix(color, "#ffffff", 0.3);
    g.lineWidth = 3;
    for (let y = knotY + 6; y < ch; y += 9) {
      g.beginPath();
      g.moveTo(cx - 6, y);
      g.lineTo(cx + 6, y + 7);
      g.stroke();
    }
    for (let i = 0; i < 23; i++) {
      const t = i / 22 - 0.5,
        x2 = cx + t * 62;
      g.strokeStyle = i % 4 === 1 ? mix(color, "#ffffff", 0.32) : i % 4 === 3 ? mix(color, "#000000", 0.18) : color;
      g.lineWidth = 4.2;
      g.beginPath();
      g.moveTo(cx + t * 14, knotY - 10);
      g.quadraticCurveTo(cx + t * 40, knotY - 44, x2, 8 + Math.abs(t) * 12);
      g.stroke();
    }
    g.fillStyle = mix(color, "#000000", 0.28);
    g.beginPath();
    g.ellipse(cx, knotY - 6, 18, 14, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = mix(color, "#ffffff", 0.4);
    g.beginPath();
    g.ellipse(cx - 6, knotY - 11, 6, 4, -0.4, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.rect(cx - 8, 0, 16, ch);
    g.clip();
    foldShade();
    g.restore();
  } else {
    const notch = 30;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(cw / 2, notch);
    g.lineTo(cw, 0);
    g.lineTo(cw, ch);
    g.lineTo(0, ch);
    g.closePath();
    const gr = g.createLinearGradient(0, 0, cw, 0);
    gr.addColorStop(0, mix(color, "#000000", 0.32));
    gr.addColorStop(0.18, color);
    gr.addColorStop(0.42, mix(color, "#ffffff", 0.32));
    gr.addColorStop(0.55, color);
    gr.addColorStop(0.86, mix(color, "#000000", 0.12));
    gr.addColorStop(1, mix(color, "#000000", 0.38));
    g.fillStyle = gr;
    g.fill();
    g.save();
    g.clip();
    g.globalAlpha = 0.1;
    g.strokeStyle = "#fff";
    g.lineWidth = 1;
    for (let x = 3; x < cw; x += 4) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, ch);
      g.stroke();
    }
    g.globalAlpha = 1;
    const tip = g.createLinearGradient(0, 0, 0, notch + 24);
    tip.addColorStop(0, "rgba(0,0,0,.22)");
    tip.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = tip;
    g.fillRect(0, 0, cw, notch + 24);
    foldShade();
    g.restore();
  }

  // soft shadow: the same shape, blurred and darkened
  const pad = 14,
    sc = document.createElement("canvas");
  sc.width = (cw + pad * 2) * S;
  sc.height = (ch + pad * 2) * S;
  const sg = sc.getContext("2d")!;
  sg.filter = `blur(${5 * S}px)`;
  sg.drawImage(c, pad * S, pad * S);
  sg.filter = "none";
  sg.globalCompositeOperation = "source-in";
  sg.fillStyle = "#1a1008";
  sg.fillRect(0, 0, sc.width, sc.height);

  const tex = new THREE.CanvasTexture(c),
    shadow = new THREE.CanvasTexture(sc);
  tex.anisotropy = 4;
  const art: RibbonArt = { tex, shadow, pad: (cw + pad * 2) / cw, padY: (ch + pad * 2) / ch, padPx: pad, chPx: ch };
  cache.set(key, art);
  return art;
}

const crops = new WeakMap<THREE.Texture, Map<string, THREE.Texture>>();

/** A view of the top `k` of a texture starting `off` up from the bottom. Cached, so it's cheap to call. */
export function cropTex(t: THREE.Texture, k: number, off: number): THREE.Texture {
  if (k === 1) return t;
  let m = crops.get(t);
  if (!m) crops.set(t, (m = new Map()));
  const key = k.toFixed(4) + ":" + off.toFixed(4);
  let c = m.get(key);
  if (!c) {
    c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(1, k);
    c.offset.set(0, off);
    m.set(key, c);
  }
  return c;
}
