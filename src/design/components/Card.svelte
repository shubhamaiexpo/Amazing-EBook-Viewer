<!--
  @component
  A colour-blocked group inside a panel. `tone="accent"` is the theme colour, `tone="info"` a soft sky.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  let { tone = "accent", title, children }: { tone?: "accent" | "info"; title?: string; children: Snippet } = $props();
</script>

<div class="card {tone}">
  {#if title}<h3 class="text-heading">{title}</h3>{/if}
  {@render children()}
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    border-radius: 26px;
  }
  .accent {
    background: var(--accent);
  }
  .info {
    background: var(--info-soft);
  }
  h3 {
    margin: 0;
  }
</style>
