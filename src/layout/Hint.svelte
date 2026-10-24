<!--
  @component
  A first-run hint at the bottom of the screen that fades after a few seconds. Also shows "Opening…".
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { reader } from "$features/reader/reader.svelte";

  let visible = $state(true);
  onMount(() => {
    const t = setTimeout(() => (visible = false), 6000);
    return () => clearTimeout(t);
  });
</script>

<div class="hint" class:gone={!visible}>Drag a page corner, click a page, or use the arrow keys</div>
{#if reader.busy}<div class="busy">{reader.busy}</div>{/if}

<style>
  .hint,
  .busy {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px var(--space-5);
    border-radius: var(--radius-lg);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    font: 600 var(--text-md) / 1 var(--font-ui);
    white-space: nowrap;
    max-width: calc(100% - 32px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hint {
    bottom: calc(22px + env(safe-area-inset-bottom, 0px));
    z-index: var(--z-chrome);
    transition: opacity 0.8s;
  }
  .gone {
    opacity: 0;
    pointer-events: none;
  }
  .busy {
    top: 50%;
    z-index: var(--z-toast);
    transform: translate(-50%, -50%);
  }
</style>
