<!--
  @component
  Six colour themes. Picking one glides the UI colours across and sends rings out from your tap.
-->
<script lang="ts">
  import { Tile } from "$design/components";
  import { applyTheme, THEMES } from "$design/themes";
  import { lastPress } from "$lib/pointer";
  import { settings } from "$stores/settings.svelte";

  function pick(id: string) {
    if (id === settings.theme) return;
    settings.theme = id;
    applyTheme(id, lastPress);
  }
</script>

<div class="grid">
  {#each THEMES as t (t.id)}
    <Tile layout="row" pressed={t.id === settings.theme} onclick={() => pick(t.id)}>
      {#snippet preview()}
        <span class="dots" aria-hidden="true">
          <b style:background={t.ink}></b><b style:background={t.accent}></b><b style:background={t.action}></b>
        </span>
      {/snippet}
      {t.name}
    </Tile>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .dots {
    display: flex;
  }
  b {
    width: 16px;
    height: 16px;
    margin-right: -5px;
    border: 2px solid var(--surface);
    border-radius: 50%;
  }
</style>
