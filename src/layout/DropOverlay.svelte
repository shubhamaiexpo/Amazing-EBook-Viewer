<!--
  @component
  Drag a PDF onto the window to open it, or an image to make it your wallpaper.
-->
<script lang="ts">
  import { chooseWallpaper } from "$features/scenes/wallpaper";
  import { openDropped } from "$features/reader/openFile";
  import { ui } from "$stores/ui.svelte";

  let depth = 0;
  const hasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes("Files");

  function enter(e: DragEvent) {
    if (!hasFiles(e)) return;
    depth++;
    ui.dropping = true;
  }
  function leave() {
    if (--depth <= 0) {
      depth = 0;
      ui.dropping = false;
    }
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    depth = 0;
    ui.dropping = false;
    const f = e.dataTransfer?.files[0];
    if (!f) return;
    if (/^image\//.test(f.type)) void chooseWallpaper(f);
    else void openDropped(f);
  }
</script>

<svelte:window ondragenter={enter} ondragleave={leave} ondragover={(e) => e.preventDefault()} ondrop={drop} />

{#if ui.dropping}
  <div class="drop"><span class="text-title">Drop the PDF to open it as a book</span></div>
{/if}

<style>
  .drop {
    position: fixed;
    inset: 12px;
    z-index: var(--z-overlay);
    display: grid;
    place-items: center;
    border: 3px dashed var(--action);
    border-radius: var(--radius-2xl);
    background: rgba(255, 255, 255, 0.9);
    pointer-events: none;
  }
</style>
