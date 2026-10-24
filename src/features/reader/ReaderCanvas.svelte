<!--
  @component
  The WebGL canvas the book is drawn on. Turns pointer input into page turns and ribbon hovers,
  and runs the animation loop. The drawing itself lives in $engine/BookRenderer.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { RibbonSpec } from "$engine/BookRenderer";
  import { ui, wake } from "$stores/ui.svelte";
  import { reader } from "./reader.svelte";

  let { onready }: { onready?: () => void } = $props();
  let canvas: HTMLCanvasElement;
  let tip = $state<{ x: number; y: number; text: string } | null>(null);

  onMount(() => {
    const book = reader.attach(canvas);
    onready?.();

    let last = performance.now(),
      raf = 0;
    const loop = (now: number) => {
      book.frame(Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const resize = () => book.resize();
    const down = (e: PointerEvent) => {
      if (ui.zoom || !reader.hasBook || book.turning) return;
      const hit = book.pick(e.clientX, e.clientY);
      if (!hit) return;
      if ("ribbon" in hit) return void reader.jumpTo(hit.ribbon.page);
      if (reader.pointerDown(e.clientX, e.clientY, hit)) canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      wake();
      if (ui.zoom) return;
      if (reader.dragging) return void reader.pointerMove(e.clientX, e.clientY);
      const hit = reader.hasBook && !book.turning ? book.pick(e.clientX, e.clientY) : null;
      const ribbon: RibbonSpec | null = hit && "ribbon" in hit ? hit.ribbon : null;
      book.hoverRibbon(ribbon);
      tip = ribbon
        ? { x: e.clientX, y: e.clientY - 46, text: `p. ${ribbon.page + 1} · ${ribbon.label || "Bookmark"}` }
        : null;
      canvas.style.cursor = ribbon || (hit && !("ribbon" in hit) && book.onPage(hit)) ? "pointer" : "default";
    };
    const up = () => void reader.pointerUp();
    const leave = () => {
      tip = null;
      book.hoverRibbon(null);
    };

    addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      book.dispose();
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="book"
  aria-label="Book. Drag a page corner or click a page to turn it. Arrow keys also turn pages."
></canvas>

{#if tip}
  <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px">{tip.text}</div>
{/if}

<style>
  .book {
    position: fixed;
    inset: 0;
    z-index: var(--z-book);
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  .tip {
    position: fixed;
    z-index: var(--z-tooltip);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--ink);
    color: var(--on-ink);
    font: var(--weight-label) var(--text-sm) / 1 var(--font-ui);
    white-space: nowrap;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateX(-50%);
    pointer-events: none;
  }
</style>
