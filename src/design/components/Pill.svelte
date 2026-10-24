<!--
  @component
  A small chunky choice button. Use `pressed` for toggles, or `role="radio"` + `checked` inside a radio group.
  `swatch` shows a colour dot before the text.
  <Pill pressed={fit === "cover"} onclick={() => (fit = "cover")}>Fill</Pill>
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { feel } from "../actions/feel";
  import { ripple } from "../actions/ripple";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    pressed?: boolean;
    /** With role="radio": whether this option is the chosen one. */
    checked?: boolean;
    role?: "radio";
    swatch?: string;
    tone?: "muted" | "glass";
    children: Snippet;
  }
  let { pressed, checked, role, swatch, tone = "muted", children, class: cls = "", ...rest }: Props = $props();
</script>

<button
  type="button"
  class="pill {tone} {cls}"
  {role}
  aria-pressed={role ? undefined : pressed}
  aria-checked={role ? !!checked : undefined}
  use:feel
  use:ripple
  {...rest}
>
  {#if swatch}<span class="swatch" style:background={swatch}></span>{/if}
  {@render children()}
</button>

<style>
  .pill {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--control-sm);
    padding: 0 var(--space-4);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--surface-muted);
    color: var(--ink);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.07);
    font: var(--weight-label) var(--text-md) / 1 var(--font-ui);
    cursor: pointer;
    transition:
      transform var(--dur-fast) var(--ease-spring),
      background-color 0.2s,
      color 0.2s;
  }
  .glass {
    background: rgba(255, 255, 255, 0.7);
  }
  .pill:hover {
    background: var(--surface-hover);
    transform: translateY(-1px);
  }
  .glass:hover {
    background: var(--surface);
  }
  .pill:active {
    transform: translateY(1px) scale(0.97);
    box-shadow: none;
  }
  .pill[aria-pressed="true"],
  .pill[aria-checked="true"] {
    background: var(--ink);
    color: var(--on-ink);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.25);
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: none;
  }
</style>
