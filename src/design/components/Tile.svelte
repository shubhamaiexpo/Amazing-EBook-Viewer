<!--
  @component
  A pickable tile for grids of choices: scenes, colour themes, watch faces.
  <Tile pressed={id === current} onclick={...}>{#snippet preview()}...{/snippet}Seaside dusk</Tile>
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { feel } from "../actions/feel";
  import { ripple } from "../actions/ripple";

  interface Props {
    pressed: boolean;
    onclick: () => void;
    layout?: "row" | "stack";
    preview?: Snippet;
    children: Snippet;
  }
  let { pressed, onclick, layout = "stack", preview, children }: Props = $props();
</script>

<button type="button" class="tile {layout}" aria-pressed={pressed} {onclick} use:feel use:ripple>
  {@render preview?.()}
  <span class="name">{@render children()}</span>
</button>

<style>
  .tile {
    position: relative;
    overflow: hidden;
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2) var(--space-3);
    border: 2.5px solid transparent;
    border-radius: var(--radius-xl);
    background: var(--surface-muted);
    color: var(--ink);
    text-align: left;
    font: var(--weight-label) var(--text-md) / 1.2 var(--font-ui);
    cursor: pointer;
    transition:
      transform var(--dur-fast) var(--ease-spring),
      box-shadow var(--dur-fast),
      background-color 0.2s;
  }
  .stack {
    flex-direction: column;
  }
  .row {
    align-items: center;
    min-height: var(--control-lg);
    padding: 0 var(--space-3);
    border-radius: var(--radius-lg);
  }
  .tile:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }
  .tile:active {
    transform: scale(0.97);
  }
  .tile[aria-pressed="true"] {
    border-color: var(--action);
    background: var(--surface);
  }
  .name {
    padding: 0 var(--space-1);
  }
</style>
