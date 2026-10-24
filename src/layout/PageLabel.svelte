<!--
  @component
  The dark label top left: the app's logo, which pages are open, and the book's title.
-->
<script lang="ts">
  import { reader } from "$features/reader/reader.svelte";
  import { spreadLabel } from "$features/reader/spreads";

  const pages = $derived(reader.hasBook ? spreadLabel(reader.spread, reader.pageCount) : "Open a PDF to begin");
</script>

<div class="label" role="status" aria-live="polite">
  <img class="logo" src="logo.svg" alt="" width="40" height="40" />
  <span class="pages" data-testid="page-label">{pages}</span>
  {#if reader.title}<span class="title">· {reader.title}</span>{/if}
</div>

<style>
  .label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
    max-width: 100%;
    height: 56px;
    padding: 0 var(--space-5) 0 var(--space-2);
    border-radius: 20px;
    background: var(--ink);
    color: var(--on-ink);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }
  .logo {
    flex: none;
    border-radius: var(--radius-sm);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }
  .pages,
  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .pages {
    font: var(--weight-heavy) var(--text-lg) / 1 var(--font-ui);
    color: var(--accent);
  }
  .title {
    font: var(--weight-body) var(--text-md) / 1 var(--font-ui);
    color: #e8e8e8;
  }
  @media (max-width: 640px) {
    .title {
      display: none;
    }
  }
</style>
