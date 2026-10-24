<!--
  The reading room, assembled. Layers from back to front:
  scene → book → chrome (top bar, arrows, watch, hint) → panels → magnifier → drop overlay → toast.
  App only wires features together; each piece's behaviour lives in its own folder under src/.
-->
<script lang="ts">
  import { feelConfig } from "$design/actions/feel";
  import { Toast } from "$design/components";
  import BookmarksPanel from "$features/bookmarks/BookmarksPanel.svelte";
  import { bookmarks } from "$features/bookmarks/bookmarks.svelte";
  import { ribbonsFor } from "$features/bookmarks/ribbonLayout";
  import Magnifier from "$features/magnifier/Magnifier.svelte";
  import { handleKey } from "$features/reader/keyboard";
  import { openSample } from "$features/reader/openFile";
  import ReaderCanvas from "$features/reader/ReaderCanvas.svelte";
  import { reader } from "$features/reader/reader.svelte";
  import SceneBackdrop from "$features/scenes/SceneBackdrop.svelte";
  import ScenePanel from "$features/scenes/ScenePanel.svelte";
  import { sceneById } from "$features/scenes/scenes";
  import Watch from "$features/watch/Watch.svelte";
  import WatchPanel from "$features/watch/WatchPanel.svelte";
  import DropOverlay from "$layout/DropOverlay.svelte";
  import EdgeArrows from "$layout/EdgeArrows.svelte";
  import Hint from "$layout/Hint.svelte";
  import TopBar from "$layout/TopBar.svelte";
  import { settings } from "$stores/settings.svelte";
  import { ui, wake } from "$stores/ui.svelte";

  let ready = $state(false);

  function onready() {
    ready = true;
    wake();
    void openSample();
  }

  // buttons bloop only when page sound is on
  $effect(() => {
    feelConfig.sound = settings.sound;
  });

  // each PDF has its own bookmarks
  $effect(() => bookmarks.load(reader.docId));

  // the scene lights the book
  $effect(() => {
    if (!ready || !reader.book) return;
    const sc = sceneById(settings.scene);
    reader.book.setLook({
      tint: sc.tint,
      shadow: sc.shadow,
      light: settings.light ?? sc.light,
      trueColour: settings.trueColour,
    });
  });

  // ribbons follow the open spread, the bookmarks and the chosen style
  $effect(() => {
    if (!ready) return;
    void reader.shown;
    reader.setRibbons(ribbonsFor(bookmarks.items, reader.spread, reader.pageCount), settings.ribbon);
  });
</script>

<svelte:window onkeydown={handleKey} onpointermove={wake} />

<SceneBackdrop />
<ReaderCanvas {onready} />
<TopBar />
<EdgeArrows />
<Hint />
<Watch />

{#if ui.panel === "bookmarks"}<BookmarksPanel />{/if}
{#if ui.panel === "scene"}<ScenePanel />{/if}
{#if ui.panel === "watch"}<WatchPanel />{/if}

<Magnifier />
<DropOverlay />
<Toast message={ui.toast} />
