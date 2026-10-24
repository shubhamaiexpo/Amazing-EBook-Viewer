<!--
  @component
  A short message near the top of the screen. Show one with toast("...") from $stores/ui.svelte.
-->
<script lang="ts">
  import { fly } from "svelte/transition";
  let { message }: { message: string } = $props();
</script>

<div class="toast-slot" role="status" aria-live="polite">
  {#if message}
    <div class="toast" transition:fly={{ y: -8, duration: 200 }}>{message}</div>
  {/if}
</div>

<style>
  .toast-slot {
    position: fixed;
    left: 50%;
    top: 84px;
    transform: translateX(-50%);
    z-index: var(--z-toast);
    max-width: calc(100% - 32px);
  }
  .toast {
    padding: 14px var(--space-5);
    border-radius: var(--radius-lg);
    background: var(--ink);
    color: var(--accent);
    font: var(--weight-label) 15px / 1.2 var(--font-ui);
  }
</style>
