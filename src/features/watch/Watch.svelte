<!--
  @component
  The watch lying beside the book. Its hands sweep smoothly; tap it for time, reading stats and a timer.
-->
<script lang="ts">
  import { settings } from "$stores/settings.svelte";
  import { togglePanel, ui } from "$stores/ui.svelte";
  import { handAngles, RING, watchSVG } from "./faces";
  import { clock } from "./readingClock.svelte";

  let face: HTMLSpanElement | undefined = $state();
  const svg = $derived(watchSVG(settings.watch));

  const p2 = (n: number) => String(n).padStart(2, "0");

  $effect(() => {
    void svg; // re-find parts when the face changes
    if (!face) return;
    const q = (n: string) => face!.querySelector(`[data-part="${n}"]`);
    const parts = Object.fromEntries(
      ["hH", "hM", "hS", "dT", "dS", "dD", "sT", "sD", "sR", "sRing"].map((n) => [n, q(n)]),
    );
    let raf = 0,
      lastSecond = -1;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const d = new Date(),
        a = handAngles(d);
      parts.hH?.setAttribute("transform", `rotate(${a.h} 55 100)`);
      parts.hM?.setAttribute("transform", `rotate(${a.m} 55 100)`);
      parts.hS?.setAttribute("transform", `rotate(${a.s} 55 100)`);
      const sec = d.getSeconds();
      if (sec === lastSecond) return;
      lastSecond = sec;
      clock.tick();
      const h = d.getHours(),
        m = d.getMinutes(),
        day = d.toLocaleDateString("en", { weekday: "short" }).toUpperCase();
      if (parts.dT) {
        parts.dT.textContent = p2(h) + (sec % 2 ? " " : ":") + p2(m);
        parts.dS!.textContent = p2(sec);
        parts.dD!.textContent = day.slice(0, 2) + " " + d.getDate();
      }
      if (parts.sT) {
        parts.sT.textContent = p2(h) + ":" + p2(m);
        parts.sD!.textContent = day + " " + d.getDate();
        parts.sRing!.setAttribute("stroke-dasharray", `${(RING * clock.ringFraction).toFixed(1)} ${RING.toFixed(1)}`);
        parts.sR!.textContent = clock.timerEnd ? `${clock.minutesLeft} min left` : `${clock.minutesRead} min read`;
      }
    };
    frame();
    return () => cancelAnimationFrame(raf);
  });

  function open() {
    clock.glow = false;
    togglePanel("watch");
  }
</script>

<button
  class="watch"
  class:glow={clock.glow}
  class:idle={ui.idle}
  aria-label="Watch. Open time and reading timer"
  onclick={open}
>
  <span class="face" bind:this={face}>{@html svg}</span>
</button>

<style>
  /* Lies on the desk in the bottom-left corner, big enough to read, with its strap running off the screen. */
  .watch {
    position: fixed;
    left: max(-14px, env(safe-area-inset-left, 0px));
    bottom: -64px;
    z-index: var(--z-chrome);
    width: 150px;
    height: 273px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transform: rotate(16deg);
    transform-origin: 50% 80%;
    transition:
      opacity 0.6s,
      filter 0.6s,
      transform 0.35s var(--ease-spring);
  }
  .watch:hover {
    transform: rotate(10deg) translateY(-8px);
  }
  .watch.idle {
    opacity: 0.85;
  }
  .glow {
    filter: drop-shadow(0 0 14px rgba(255, 214, 120, 0.95));
  }
  .face,
  .face :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
  .face :global(svg) {
    filter: drop-shadow(5px 9px 5px rgba(40, 20, 5, 0.38)) drop-shadow(1px 2px 1px rgba(40, 20, 5, 0.25));
  }
  @media (max-width: 640px) {
    .watch {
      width: 104px;
      height: 189px;
      bottom: -48px;
    }
  }
</style>
