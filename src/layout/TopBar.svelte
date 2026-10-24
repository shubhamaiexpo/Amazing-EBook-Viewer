<!--
  @component
  The strip along the top: page label on the left, the dock on the right. Fades while you read.
-->
<script lang="ts">
  import { ui } from "$stores/ui.svelte";
  import Dock from "./Dock.svelte";
  import PageLabel from "./PageLabel.svelte";
</script>

<header class="top" class:idle={ui.idle}>
  <PageLabel />
  <Dock />
</header>

<style>
  .top {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: var(--z-chrome);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: calc(18px + env(safe-area-inset-top, 0px)) max(20px, env(safe-area-inset-right, 0px)) 0
      max(20px, env(safe-area-inset-left, 0px));
    pointer-events: none;
    transition: opacity 0.6s;
  }
  .top > :global(*) {
    pointer-events: auto;
  }
  .idle {
    opacity: 0;
  }
</style>
