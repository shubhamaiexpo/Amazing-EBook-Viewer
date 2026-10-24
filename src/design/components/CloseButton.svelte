<!--
  @component
  Square close button for panels. Spins a quarter turn on hover.
-->
<script lang="ts">
  import { feel } from "../actions/feel";
  import Icon from "./Icon.svelte";

  let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<button type="button" class="x" aria-label={label} {onclick} use:feel={{ magnetic: true }}>
  <Icon name="close" />
</button>

<style>
  .x {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--control-sm);
    height: var(--control-sm);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--surface-muted);
    color: var(--ink);
    cursor: pointer;
    transition:
      transform var(--dur-fast) var(--ease-spring),
      translate var(--dur-base) var(--ease-spring),
      background-color 0.2s,
      color 0.2s;
  }
  .x:hover {
    background: var(--ink);
    color: var(--on-ink);
    transform: rotate(90deg);
  }
  .x:active {
    transform: rotate(90deg) scale(0.9);
  }
</style>
