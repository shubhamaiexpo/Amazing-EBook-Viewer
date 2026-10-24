import * as THREE from "three";
import { roundedPageCanvas } from "$engine/canvasArt";
import type { PdfBook } from "$features/pdf/pdfDocument";
import { nearbyPages } from "./spreads";

/**
 * Rendered pages and their textures, kept for the spreads around the one that's open.
 * A page gets a separate texture for each side of the book, because its rounded corners face outward.
 */
export class PageCache {
  private canvases = new Map<number, Promise<HTMLCanvasElement>>();
  private textures = new Map<string, Promise<THREE.Texture>>();
  private generation = 0;
  /** Finished canvases, for code that needs one right now (the magnifier). */
  readonly ready = new Map<number, HTMLCanvasElement>();

  constructor(
    private readonly anisotropy: number,
    private book: PdfBook | null = null,
  ) {}

  /** Start over with a new document. */
  reset(book: PdfBook | null): void {
    this.generation++;
    for (const t of this.textures.values()) t.then((x) => x.dispose());
    this.textures.clear();
    this.canvases.clear();
    this.ready.clear();
    this.book = book;
  }

  /** Texture height: a little under the window's height in device pixels, capped for GPUs. */
  static height(): number {
    return Math.min(2048, Math.round(innerHeight * Math.min(devicePixelRatio || 1, 2) * 0.82));
  }

  canvas(i: number): Promise<HTMLCanvasElement> | null {
    if (!this.book || i < 0 || i >= this.book.pageCount) return null;
    let c = this.canvases.get(i);
    if (!c) {
      c = this.book.render(i, PageCache.height());
      this.canvases.set(i, c);
    }
    return c;
  }

  async texture(i: number, outerRight: boolean): Promise<THREE.Texture | null> {
    const src = this.canvas(i);
    if (!src) return null;
    const key = i + (outerRight ? "R" : "L");
    let t = this.textures.get(key);
    if (!t) {
      const gen = this.generation;
      t = src.then((c) => {
        if (gen === this.generation) this.ready.set(i, c);
        const tex = new THREE.CanvasTexture(roundedPageCanvas(c, c.width, c.height, outerRight));
        tex.anisotropy = this.anisotropy;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
      });
      this.textures.set(key, t);
    }
    return t;
  }

  /** Forget pages far from the open spread. */
  trim(spread: number): void {
    if (!this.book) return;
    const keep = nearbyPages(spread, this.book.pageCount);
    for (const [k, t] of this.textures) {
      if (!keep.has(parseInt(k))) {
        t.then((x) => x.dispose());
        this.textures.delete(k);
      }
    }
    for (const i of this.canvases.keys()) {
      if (!keep.has(i)) {
        this.canvases.delete(i);
        this.ready.delete(i);
      }
    }
  }
}
