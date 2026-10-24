<!--
  @component
  A row of joined options where exactly one is chosen.
  - kind "tabs":   switches views (role=tab); selected uses the action colour
  - kind "choice": picks a value (aria-pressed); selected uses the accent colour
  <Segmented label="Bookmark views" options={[{ value: "page", label: "By page" }]} bind:value={view} />
-->
<script lang="ts" generics="T extends string | number">
  import { feel } from "../actions/feel";

  interface Props {
    label: string;
    options: readonly { value: T; label: string }[];
    value: T;
    kind?: "tabs" | "choice";
    onchange?: (value: T) => void;
  }
  let { label, options, value = $bindable(), kind = "tabs", onchange }: Props = $props();

  function pick(v: T) {
    value = v;
    onchange?.(v);
  }
</script>

<div class="seg {kind}" role={kind === "tabs" ? "tablist" : "group"} aria-label={label}>
  {#each options as o (o.value)}
    {#if kind === "tabs"}
      <button type="button" role="tab" aria-selected={o.value === value} onclick={() => pick(o.value)} use:feel>
        {o.label}
      </button>
    {:else}
      <button type="button" aria-pressed={o.value === value} onclick={() => pick(o.value)} use:feel>
        {o.label}
      </button>
    {/if}
  {/each}
</div>

<style>
  .seg {
    display: flex;
    gap: var(--space-1);
    padding: 5px;
    border-radius: var(--radius-lg);
    background: var(--surface-muted);
  }
  button {
    flex: 1;
    min-height: 42px;
    min-width: 58px;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--ink);
    font: var(--weight-label) var(--text-md) / 1 var(--font-ui);
    cursor: pointer;
    transition:
      transform var(--dur-fast) var(--ease-spring),
      background-color 0.2s,
      color 0.2s;
  }
  button:active {
    transform: scale(0.96);
  }
  .tabs [aria-selected="true"] {
    background: var(--action);
    color: var(--on-ink);
  }
  .choice [aria-pressed="true"] {
    background: var(--accent);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.1);
  }
</style>
