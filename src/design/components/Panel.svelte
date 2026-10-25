<!--
  @component
  A floating sheet that pours in from where it was opened. `placement` decides where it docks:
  left (bookmarks), right (scene), watch (bottom left, beside the watch).
  <Panel title="Scene" subtitle="..." placement="right" onclose={closePanels}>...</Panel>
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { pour } from "../actions/pour";
  import CloseButton from "./CloseButton.svelte";

  interface Props {
    title: string;
    subtitle?: string;
    placement: "left" | "right" | "watch";
    onclose: () => void;
    children: Snippet;
  }
  let { title, subtitle, placement, onclose, children }: Props = $props();
</script>

<section class="panel {placement}" aria-label={title} in:pour out:fade={{ duration: 120 }}>
  <header>
    <div class="titles">
      <h2 class="text-title">{title}</h2>
      {#if subtitle}<p class="text-body">{subtitle}</p>{/if}
    </div>
    <CloseButton label="Close {title.toLowerCase()}" onclick={onclose} />
  </header>
  {@render children()}
</section>

<style>
  .panel {
    position: fixed;
    z-index: var(--z-panel);
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-height: calc(100% - 32px);
    padding: var(--space-7);
    overflow: auto;
    border-radius: var(--radius-2xl);
    background: var(--surface);
    box-shadow: var(--shadow-lg);
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .titles {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  h2,
  p {
    margin: 0;
  }
  .left {
    left: max(16px, env(safe-area-inset-left, 0px));
    top: 16px;
    bottom: 16px;
    width: min(420px, calc(100% - 32px));
  }
  .right {
    right: max(16px, env(safe-area-inset-right, 0px));
    top: 16px;
    bottom: 16px;
    width: min(400px, calc(100% - 32px));
  }
  /* beside the watch, which lies in the bottom-left corner */
  .watch {
    left: 176px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    width: min(320px, calc(100% - 32px));
  }
  @media (max-width: 640px) {
    .watch {
      left: 16px;
      bottom: 160px;
    }
  }
</style>
