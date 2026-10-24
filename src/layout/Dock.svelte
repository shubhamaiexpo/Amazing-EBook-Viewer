<!--
  @component
  The toolbar: open a PDF, bookmark, magnifier, bookmarks list, scene and fullscreen.
  To add a tool, add a <Button variant="dock"> here with an icon from $design/components/icons.ts.
-->
<script lang="ts">
  import { Button } from "$design/components";
  import { openPicked } from "$features/reader/openFile";
  import { setZoom } from "$features/reader/keyboard";
  import { platform } from "$platform/index";
  import { toast, togglePanel, ui } from "$stores/ui.svelte";

  function markHere() {
    if (ui.panel !== "bookmarks") togglePanel("bookmarks");
    ui.focusLabel++;
  }

  async function fullscreen() {
    try {
      await platform.toggleFullscreen();
    } catch {
      toast("Fullscreen isn't available here.");
    }
  }
</script>

<nav class="dock" aria-label="Tools">
  <Button variant="open" icon="plus" iconAct="spin" label="Open PDF" class="open-btn" onclick={openPicked} />
  <Button
    variant="dock"
    icon="bookmark"
    iconAct="drop"
    iconOnly
    label="Bookmark this page"
    tip="Bookmark this page · B"
    onclick={markHere}
  />
  <Button
    variant="dock"
    icon="magnifier"
    iconAct="wiggle"
    iconOnly
    label="Magnifier"
    tip="Magnifier · Z"
    pressed={ui.zoom}
    onclick={() => setZoom(!ui.zoom)}
  />
  <Button
    variant="dock"
    icon="list"
    iconAct="shimmy"
    iconOnly
    label="Bookmarks"
    tip="Bookmarks"
    pressed={ui.panel === "bookmarks"}
    onclick={() => togglePanel("bookmarks")}
  />
  <Button
    variant="dock"
    icon="scene"
    iconAct="rise"
    iconOnly
    label="Scene"
    tip="Scene"
    pressed={ui.panel === "scene"}
    onclick={() => togglePanel("scene")}
  />
  <span class="sep" aria-hidden="true"></span>
  <Button
    variant="dock"
    icon="fullscreen"
    iconAct="grow"
    iconOnly
    label="Fullscreen"
    tip="Fullscreen"
    class="last"
    onclick={fullscreen}
  />
</nav>

<style>
  .dock {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: 6px;
    border-radius: 26px;
    background: var(--surface);
    box-shadow: var(--shadow-md);
  }
  .dock :global(.open-btn) {
    margin-right: var(--space-1);
  }
  /* keep the last tooltip on screen */
  .dock :global(.last[data-tip]::after) {
    left: auto;
    right: 0;
    transform: translate(0, -4px);
  }
  .dock :global(.last[data-tip]:hover::after) {
    transform: none;
  }
  .sep {
    width: 2px;
    height: 26px;
    margin: 0 var(--space-1);
    border-radius: 2px;
    background: var(--line);
  }
  @media (max-width: 640px) {
    .dock {
      padding: var(--space-1);
      border-radius: 22px;
    }
    .dock :global(.open-btn .text),
    .sep {
      display: none;
    }
  }
</style>
