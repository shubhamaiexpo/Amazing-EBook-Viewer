<!--
  @component
  The one button. Pick a look with `variant`:
  - surface: white, for loose buttons on the scene
  - dock:    flat, lives inside <Dock>; turns ink + accent when pressed
  - open:    the accent call to action in the dock ("Open PDF")
  - primary: dark, chunky, for the main action in a panel
  - edge:    round page arrow on the side of the screen
  Give icon-only buttons a `label`; it becomes the accessible name and, with `tip`, a hover label.

  <Button variant="dock" icon="bookmark" iconAct="drop" label="Bookmark this page" tip="Bookmark · B" onclick={mark} />
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { feel } from "../actions/feel";
  import { ripple } from "../actions/ripple";
  import Icon from "./Icon.svelte";
  import type { IconAct, IconName } from "./icons";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    variant?: "surface" | "dock" | "open" | "primary" | "edge";
    icon?: IconName;
    iconAct?: IconAct;
    /** Accessible name. Shown as text unless the button is icon-only. */
    label: string;
    /** Show only the icon; the label stays for screen readers. */
    iconOnly?: boolean;
    /** Hover label under the button (dock buttons). */
    tip?: string;
    pressed?: boolean;
    children?: Snippet;
  }
  let {
    variant = "surface",
    icon,
    iconAct,
    label,
    iconOnly = false,
    tip,
    pressed,
    children,
    type = "button",
    class: cls = "",
    ...rest
  }: Props = $props();

  const magnetic = $derived(variant === "dock" || variant === "edge" || variant === "primary");
</script>

<button
  {type}
  class="btn {variant} {cls}"
  class:icon-only={iconOnly}
  aria-label={iconOnly ? label : undefined}
  aria-pressed={pressed}
  data-tip={tip}
  use:feel={{ magnetic }}
  use:ripple
  {...rest}
>
  {#if icon}<Icon name={icon} act={iconAct} size={variant === "edge" ? "lg" : "md"} />{/if}
  {#if !iconOnly}<span class="text">{label}</span>{/if}
  {@render children?.()}
</button>

<style>
  .btn {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    height: var(--control-lg);
    min-width: var(--control-lg);
    padding: 0 18px;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--surface);
    color: var(--ink);
    font: var(--weight-label) var(--text-md) / 1 var(--font-ui);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition:
      transform var(--dur-fast) var(--ease-spring),
      translate var(--dur-base) var(--ease-spring),
      box-shadow var(--dur-fast),
      background-color 0.2s,
      color 0.2s;
  }
  .btn.icon-only {
    width: var(--control-lg);
    padding: 0;
  }
  .btn:disabled {
    cursor: default;
  }

  /* dock */
  .dock {
    height: var(--control-md);
    min-width: var(--control-md);
    border-radius: 19px;
    background: transparent;
    box-shadow: none;
  }
  .dock.icon-only {
    width: var(--control-md);
  }
  .dock:hover {
    background: var(--surface-muted);
    transform: translateY(-1px);
  }
  .dock:active {
    transform: translateY(1px) scale(0.94);
  }
  .dock[aria-pressed="true"] {
    background: var(--ink);
    color: var(--accent);
  }

  /* open */
  .open {
    height: var(--control-md);
    padding: 0 18px 0 14px;
    border-radius: 19px;
    background: var(--accent);
    box-shadow: var(--lip);
  }
  .open:hover {
    filter: brightness(1.04);
  }
  .open:active {
    transform: translateY(1px) scale(0.96);
  }

  /* primary */
  .primary {
    padding: 0 22px;
    background: var(--ink);
    color: var(--on-ink);
    box-shadow:
      var(--lip-dark),
      0 8px 18px rgba(0, 0, 0, 0.18);
  }
  .primary :global(.icon) {
    color: var(--accent);
  }
  .primary:hover {
    transform: translateY(-1px);
  }
  .primary:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 3px 8px rgba(0, 0, 0, 0.18);
  }

  /* edge: a true circle */
  .edge {
    width: var(--control-xl);
    height: var(--control-xl);
    min-width: var(--control-xl);
    padding: 0;
    border-radius: 50%;
    background: var(--action);
    color: var(--on-ink);
    box-shadow:
      inset 0 -5px 0 rgba(0, 0, 0, 0.14),
      0 10px 24px rgba(0, 0, 0, 0.2);
  }
  .edge :global(.icon) {
    stroke-width: 2.8;
    transition: transform 0.2s;
  }
  .edge:hover {
    transform: scale(1.07);
  }
  .edge:active {
    transform: scale(0.94);
  }
  .edge:disabled {
    opacity: 0.25;
    transform: none;
  }

  /* hover labels */
  [data-tip] {
    overflow: visible;
  }
  [data-tip]::after {
    content: attr(data-tip);
    position: absolute;
    top: calc(100% + 12px);
    left: 50%;
    transform: translate(-50%, -4px);
    white-space: nowrap;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--ink);
    color: var(--on-ink);
    font: var(--weight-label) var(--text-sm) / 1 var(--font-ui);
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.15s,
      transform 0.15s;
    z-index: var(--z-tooltip);
  }
  [data-tip]:hover::after {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  @media (hover: none) {
    [data-tip]::after {
      display: none;
    }
  }
</style>
