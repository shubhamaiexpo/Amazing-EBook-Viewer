<!--
  @component
  The room behind the book: background, the person's wallpaper, a dimmer and a simple drawing.
  When the scene changes, a frozen copy of the old room dissolves on top so the change is a soft crossfade.
-->
<script lang="ts">
  import { reduceMotion } from "$lib/motion";
  import { settings, wallpaper } from "$stores/settings.svelte";
  import { sceneArtSVG } from "./sceneArt";
  import { sceneById } from "./scenes";

  let room: HTMLDivElement | undefined = $state();
  let W = $state(innerWidth),
    H = $state(innerHeight);
  const scene = $derived(sceneById(settings.scene));
  const isWall = $derived(settings.scene === "wall");
  const key = $derived(settings.scene + (wallpaper.url ? "1" : ""));

  let shown = "";
  $effect.pre(() => {
    const k = key;
    if (shown && shown !== k && room && !reduceMotion) {
      const ghost = room.cloneNode(true) as HTMLElement;
      ghost.classList.add("ghost");
      room.after(ghost);
      ghost.animate(
        [
          { opacity: 1, filter: "blur(0px)" },
          { opacity: 0, filter: "blur(6px)" },
        ],
        { duration: 700, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
      ).onfinish = () => ghost.remove();
    }
    shown = k;
  });
</script>

<svelte:window bind:innerWidth={W} bind:innerHeight={H} />

<div class="room" bind:this={room} aria-hidden="true">
  <div class="layer" style:background={scene.bg}></div>
  {#if isWall && wallpaper.url}
    <div
      class="layer wall"
      style:background-image="url({wallpaper.url})"
      style:background-size={settings.fit === "tile" ? "360px auto" : settings.fit}
      style:background-repeat={settings.fit === "tile" ? "repeat" : "no-repeat"}
      style:filter={settings.blur ? `blur(${settings.blur}px)` : "none"}
    ></div>
  {/if}
  {#if isWall}<div class="layer dim" style:opacity={settings.dim / 100}></div>{/if}
  <svg class="layer" viewBox="0 0 {W} {H}">{@html sceneArtSVG(scene.art, W, H)}</svg>
</div>

<style>
  .room,
  :global(.room.ghost) {
    position: fixed;
    inset: 0;
    z-index: var(--z-scene);
    pointer-events: none;
  }
  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .wall {
    inset: -24px;
    width: auto;
    height: auto;
    background-position: center;
  }
  .dim {
    background: #000;
  }
</style>
