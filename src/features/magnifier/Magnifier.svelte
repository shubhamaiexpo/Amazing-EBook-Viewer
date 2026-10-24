<!--
  @component
  A loupe that follows the pointer over the pages. It reads a sharper render of the page,
  so the art stays crisp up close. Scroll to change zoom; Esc or Z closes it.
-->
<script lang="ts">
  import { reader } from "$features/reader/reader.svelte";
  import { ui } from "$stores/ui.svelte";

  const LENS = 240; // px, matches the CSS size
  const HI_RES = 2600; // px tall
  let level = $state(2.5);
  let pos = $state<{ x: number; y: number } | null>(null);
  let canvas: HTMLCanvasElement | undefined = $state();

  const hi = new Map<number, HTMLCanvasElement>();
  const pending = new Set<number>();
  let hiDoc = "";

  function sharp(i: number): HTMLCanvasElement | undefined {
    if (hiDoc !== reader.docId) {
      hi.clear();
      pending.clear();
      hiDoc = reader.docId;
    }
    const got = hi.get(i);
    if (got || pending.has(i)) return got;
    const job = reader.renderPage(i, HI_RES);
    if (!job) return;
    pending.add(i);
    const doc = hiDoc;
    job
      .then((c) => {
        if (doc !== hiDoc) return;
        hi.set(i, c);
        while (hi.size > 3) hi.delete(hi.keys().next().value!);
        if (lastPoint) draw(lastPoint.x, lastPoint.y);
      })
      .catch(() => {})
      .finally(() => pending.delete(i));
  }

  let lastPoint: { x: number; y: number } | null = null;

  function draw(cx: number, cy: number) {
    lastPoint = { x: cx, y: cy };
    const book = reader.book;
    const hit = book && reader.hasBook && !book.turning ? book.pick(cx, cy) : null;
    if (!book || !hit || "ribbon" in hit || !book.onPage(hit)) return (pos = null);
    const [l, r] = reader.spreadPages;
    const left = hit.x < 0,
      idx = left ? l : r;
    if (idx < 0) return (pos = null);
    const { W, H } = book;
    const fx = left ? (hit.x + W) / W : hit.x / W,
      fy = (H / 2 - hit.y) / H;
    const src = sharp(idx) ?? reader.pages?.ready.get(idx);
    if (!src || !canvas) return;
    // how many source pixels the lens covers, from the page's size on screen
    const a = book.toScreen(0, 0),
      b = book.toScreen(W, 0);
    const pageScreenW = Math.hypot(b.x - a.x, b.y - a.y);
    const span = (LENS * (src.width / pageScreenW)) / level;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== LENS * dpr) canvas.width = canvas.height = LENS * dpr;
    const g = canvas.getContext("2d")!;
    g.fillStyle = "#f3ead6";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.imageSmoothingQuality = "high";
    g.drawImage(
      src,
      fx * src.width - span / 2,
      fy * src.height - span / 2,
      span,
      span,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    pos = { x: cx, y: cy };
  }

  $effect(() => {
    if (!ui.zoom) {
      pos = null;
      return;
    }
    const move = (e: PointerEvent) => draw(e.clientX, e.clientY);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      level = Math.max(1.5, Math.min(6, level * (e.deltaY > 0 ? 0.9 : 1.1)));
      if (lastPoint) draw(lastPoint.x, lastPoint.y);
    };
    const leave = () => (pos = null);
    addEventListener("pointermove", move);
    addEventListener("pointerdown", move);
    addEventListener("wheel", wheel, { passive: false });
    document.documentElement.addEventListener("pointerleave", leave);
    document.body.classList.add("zooming");
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", move);
      removeEventListener("wheel", wheel);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.body.classList.remove("zooming");
    };
  });
</script>

{#if ui.zoom}
  <div class="lens" hidden={!pos} style:transform="translate({pos?.x ?? 0}px, {pos?.y ?? 0}px)">
    <canvas bind:this={canvas}></canvas>
  </div>
  {#if pos}
    <div class="tag" style:left="{pos.x}px" style:top="{pos.y + LENS / 2 + 12}px">
      {level.toFixed(1).replace(/\.0$/, "")}×
    </div>
  {/if}
{/if}

<style>
  .lens {
    position: fixed;
    left: 0;
    top: 0;
    z-index: var(--z-panel);
    width: 240px;
    height: 240px;
    margin: -120px 0 0 -120px;
    overflow: hidden;
    border: 6px solid var(--surface);
    border-radius: 50%;
    background: #f3ead6;
    box-shadow:
      0 14px 40px rgba(0, 0, 0, 0.28),
      inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    pointer-events: none;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .tag {
    position: fixed;
    z-index: var(--z-panel);
    padding: 6px var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--ink);
    color: var(--accent);
    font: var(--weight-heavy) var(--text-sm) / 1 var(--font-ui);
    transform: translate(-50%, 0);
    pointer-events: none;
  }
  :global(body.zooming canvas.book) {
    cursor: none;
  }
</style>
