import type * as THREE from "three";
import { BookRenderer, type RibbonSpec } from "$engine/BookRenderer";
import type { RibbonStyle } from "$engine/ribbonArt";
import { openPdf, PdfError, type PdfBook } from "$features/pdf/pdfDocument";
import { easeInOutCubic, reduceMotion } from "$lib/motion";
import { playPaper } from "$lib/sound";
import { storage } from "$platform/index";
import { settings } from "$stores/settings.svelte";
import { toast } from "$stores/ui.svelte";
import { PageCache } from "./pageCache";
import { currentPage, lastSpread, spreadOf, spreadPages } from "./spreads";

/** Durations in milliseconds. */
const TURN_MS = reduceMotion ? 260 : 820;
const JUMP_MS = reduceMotion ? 200 : 520;

interface Drag {
  dir: 1 | -1;
  x0: number;
  y0: number;
  v0: number;
  started: boolean;
  lean: number;
  t: number | null;
}

/**
 * The open book: which PDF, which spread, and turning between spreads.
 * Components read its $state fields; they call its methods to turn pages.
 * It owns the BookRenderer once ReaderCanvas has attached one.
 */
class Reader {
  title = $state("");
  pageCount = $state(0);
  spread = $state(0);
  docId = $state("");
  /** Shown while a PDF is opening: "Opening My Book…". */
  busy = $state("");
  /** Bumped whenever a new spread has been drawn, so ribbons and labels can follow. */
  shown = $state(0);
  pagesTurned = $state(0);
  hasBook = $state(false);

  book: BookRenderer | null = null;
  private doc: PdfBook | null = null;
  pages: PageCache | null = null;
  private preparing = false;
  private landOn: number | null = null;
  private drag: Drag | null = null;

  get last(): number {
    return lastSpread(this.pageCount);
  }
  get currentPage(): number {
    return currentPage(this.spread, this.pageCount);
  }
  get spreadPages() {
    return spreadPages(this.spread, this.pageCount);
  }

  attach(canvas: HTMLCanvasElement): BookRenderer {
    this.book = new BookRenderer(canvas);
    this.pages = new PageCache(this.book.maxAnisotropy);
    return this.book;
  }

  async open(bytes: Uint8Array, fileName: string): Promise<void> {
    if (!this.book || !this.pages) return;
    this.busy = `Opening ${fileName.replace(/\.pdf$/i, "")}…`;
    try {
      const doc = await openPdf(bytes, fileName);
      this.doc?.close();
      this.doc = doc;
      this.pages.reset(doc);
      this.book.setPageAspect(doc.aspect);
      this.title = doc.title;
      this.pageCount = doc.pageCount;
      this.docId = doc.id;
      this.hasBook = true;
      storage.set("last", doc.id);
      await this.show(Math.min(storage.get("progress:" + doc.id, 0), this.last));
    } catch (err) {
      console.error(err);
      toast(
        err instanceof PdfError && err.kind === "password"
          ? "This PDF is password protected. Remove the password and open it again."
          : "That file couldn't be read as a PDF. Try another one.",
      );
    } finally {
      this.busy = "";
    }
  }

  private tex(i: number, outerRight: boolean): Promise<THREE.Texture | null> {
    return this.pages ? this.pages.texture(i, outerRight).catch(() => null) : Promise.resolve(null);
  }

  /** Draw spread `s` flat, then warm up the pages either side of it. */
  async show(s: number): Promise<void> {
    if (!this.book || !this.pages) return;
    this.spread = Math.max(0, Math.min(this.last, s));
    const [l, r] = spreadPages(this.spread, this.pageCount);
    const [tl, tr] = await Promise.all([this.tex(l, false), this.tex(r, true)]);
    if (this.book.turning) return;
    this.book.setPages(tl, tr);
    this.book.setStacks(this.pageCount ? this.spread / Math.max(1, this.last) : 0, this.pageCount);
    if (this.docId) storage.set("progress:" + this.docId, this.spread);
    this.shown++;
    for (const [i, side] of [
      [r + 1, false],
      [r + 2, true],
      [l - 1, true],
      [l - 2, false],
    ] as const) {
      if (i >= 0 && i < this.pageCount) void this.tex(i, side);
    }
    this.pages.trim(this.spread);
  }

  /** Render a page at any height, outside the cache (the magnifier asks for sharp copies). */
  renderPage(index: number, height: number): Promise<HTMLCanvasElement> | null {
    return this.doc && index >= 0 && index < this.pageCount ? this.doc.render(index, height) : null;
  }

  setRibbons(list: RibbonSpec[], style: RibbonStyle): void {
    this.book?.setRibbons(list, style);
  }

  /** Lift the page that's about to turn. Resolves false if it can't turn (first/last spread, already turning). */
  private async begin(dir: 1 | -1): Promise<boolean> {
    const book = this.book;
    if (!book || !this.hasBook || book.turning || this.preparing) return false;
    if (dir > 0 && this.spread >= this.last) return false;
    if (dir < 0 && this.spread <= 0) return false;
    this.preparing = true;
    const [l, r] = spreadPages(this.spread, this.pageCount),
      [nl, nr] = spreadPages(this.spread + dir, this.pageCount);
    // the turning sheet carries one page on its front and the next on its back;
    // underneath, the pages it uncovers are already in place
    const [front, back, under, stay] =
      dir > 0
        ? await Promise.all([this.tex(r, true), this.tex(nl, false), this.tex(nr, true), this.tex(l, false)])
        : await Promise.all([this.tex(l, false), this.tex(nr, true), this.tex(nl, false), this.tex(r, true)]);
    if (dir > 0) book.setPages(stay, under);
    else book.setPages(under, stay);
    book.startTurn(dir, front, back);
    this.preparing = false;
    return true;
  }

  private finish(done: boolean, dir: 1 | -1): void {
    this.book?.endTurn();
    let next = this.spread;
    if (done) {
      next = this.landOn ?? this.spread + dir;
      this.pagesTurned++;
      playPaper(settings.sound);
    }
    this.landOn = null;
    void this.show(next);
  }

  private animate(dir: 1 | -1, t0: number, t1: number, lean: number, dur: number, done: boolean): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now: number) => {
        if (!this.book?.turning) return resolve();
        const k = Math.min(1, (now - start) / dur);
        this.book.curl(t0 + (t1 - t0) * easeInOutCubic(k), lean);
        if (k < 1) requestAnimationFrame(step);
        else {
          this.finish(done, dir);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  async turn(dir: 1 | -1): Promise<void> {
    if (await this.begin(dir)) await this.animate(dir, 0, 1, -0.6, TURN_MS, true);
  }

  /** Riffle to the spread holding `page`: one quick turn, landing on the target. */
  async jumpTo(page: number): Promise<void> {
    const target = Math.max(0, Math.min(this.last, spreadOf(page)));
    if (target === this.spread) return;
    const dir = target > this.spread ? 1 : -1;
    if (!(await this.begin(dir))) return;
    this.landOn = target;
    await this.animate(dir, 0, 1, -0.6, JUMP_MS, true);
  }

  // ---- dragging a page by hand ----

  /** Pointer went down on the book plane at (x, y) in book coordinates. Returns true if a drag began. */
  pointerDown(clientX: number, clientY: number, p: { x: number; y: number }): boolean {
    if (!this.book || !this.hasBook || this.book.turning || !this.book.onPage(p)) return false;
    this.drag = { dir: p.x > 0 ? 1 : -1, x0: clientX, y0: clientY, v0: p.y, started: false, lean: 0, t: null };
    return true;
  }

  get dragging(): boolean {
    return !!this.drag;
  }

  async pointerMove(clientX: number, clientY: number): Promise<void> {
    const d = this.drag,
      book = this.book;
    if (!d || !book) return;
    if (!d.started && Math.hypot(clientX - d.x0, clientY - d.y0) > 6) {
      d.started = true;
      if (!(await this.begin(d.dir))) {
        if (this.drag === d) this.drag = null;
        return;
      }
      if (this.drag !== d) return this.finish(false, d.dir); // released while the page was lifting
      d.lean = Math.max(-1, Math.min(1, d.v0 / (book.H / 2))); // the corner nearest the grab leads
    }
    if (d.started && book.turning) {
      const hit = book.pick(clientX, clientY);
      if (!hit || "ribbon" in hit) return;
      // progress follows the pointer across the book; the page stays hinged at the spine
      const px = Math.max(-book.W, Math.min(book.W, hit.x * d.dir));
      d.t = (book.W - px) / (2 * book.W);
      book.curl(d.t, d.lean);
    }
  }

  async pointerUp(): Promise<void> {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    if (!d.started) return this.turn(d.dir); // a click turns the page
    if (!this.book?.turning || d.t == null) {
      if (this.book?.turning) this.finish(false, d.dir);
      return;
    }
    const done = d.t > 0.3;
    const dur = reduceMotion ? 200 : 420 * Math.max(0.4, done ? 1 - d.t : d.t) + 120;
    await this.animate(d.dir, d.t, done ? 1 : 0, d.lean, dur, done);
  }
}

export const reader = new Reader();
