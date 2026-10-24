<!--
  @component
  Round page arrows on each side of the screen.
-->
<script lang="ts">
  import { Button } from "$design/components";
  import { reader } from "$features/reader/reader.svelte";
  import { ui } from "$stores/ui.svelte";
</script>

<div class="edge prev" class:idle={ui.idle}>
  <Button
    variant="edge"
    icon="prev"
    iconOnly
    label="Previous page"
    disabled={!reader.hasBook || reader.spread === 0}
    onclick={() => reader.turn(-1)}
  />
</div>
<div class="edge next" class:idle={ui.idle}>
  <Button
    variant="edge"
    icon="next"
    iconOnly
    label="Next page"
    disabled={!reader.hasBook || reader.spread >= reader.last}
    onclick={() => reader.turn(1)}
  />
</div>

<style>
  .edge {
    position: fixed;
    top: 50%;
    z-index: var(--z-chrome);
    transform: translateY(-50%);
    transition: opacity 0.6s;
  }
  .prev {
    left: max(16px, env(safe-area-inset-left, 0px));
  }
  .next {
    right: max(16px, env(safe-area-inset-right, 0px));
  }
  .idle {
    opacity: 0;
  }
  .prev:hover :global(.icon) {
    transform: translateX(-3px);
  }
  .next:hover :global(.icon) {
    transform: translateX(3px);
  }
  @media (max-width: 640px) {
    .edge {
      display: none;
    }
  }
</style>
