<!--
  @component
  Bookmarks: tie a labelled ribbon on this page, pick a ribbon style, and jump to any marked page.
-->
<script lang="ts">
  import { Button, Card, Field, Icon, Panel, Pill, Segmented } from "$design/components";
  import { reader } from "$features/reader/reader.svelte";
  import { platform } from "$platform/index";
  import { settings } from "$stores/settings.svelte";
  import { closePanels, toast, ui } from "$stores/ui.svelte";
  import { bookmarks, type Bookmark } from "./bookmarks.svelte";
  import { collectionById, COLLECTIONS, RIBBON_STYLES } from "./collections";
  import RibbonSwatch from "./RibbonSwatch.svelte";

  let label = $state("");
  let view = $state<"page" | "coll">("page");

  function submit(e: SubmitEvent) {
    e.preventDefault();
    tie(label.trim());
    label = "";
  }

  function tie(text: string) {
    const page = reader.currentPage;
    bookmarks.add(page, text);
    toast(`Ribbon tied on page ${page + 1}`);
  }

  function go(b: Bookmark) {
    closePanels();
    void reader.jumpTo(b.page);
  }

  const groups = $derived(
    view === "page"
      ? [{ name: "", items: bookmarks.items }]
      : COLLECTIONS.map((c) => ({ name: c.name, items: bookmarks.items.filter((b) => b.coll === c.id) })).filter(
          (g) => g.items.length,
        ),
  );
</script>

<Panel title="Bookmarks" subtitle={reader.title} placement="left" onclose={closePanels}>
  <form onsubmit={submit}>
    <Card title="Mark page {reader.currentPage + 1}">
      <Field label="Your label" placeholder="Where the story turns" bind:value={label} focusKey={ui.focusLabel} />
      <div class="row" role="radiogroup" aria-label="Collection">
        {#each COLLECTIONS as c (c.id)}
          <Pill
            role="radio"
            tone="glass"
            checked={c.id === bookmarks.collection}
            swatch={c.color}
            onclick={() => (bookmarks.collection = c.id)}>{c.name}</Pill
          >
        {/each}
      </div>
      <Button type="submit" variant="primary" icon="bookmark" iconAct="drop" label="Tie the ribbon" />
    </Card>
  </form>

  <div class="group">
    <h3 class="text-label">Ribbon style</h3>
    <div class="row">
      {#each RIBBON_STYLES as r (r.id)}
        <Pill pressed={settings.ribbon === r.id} onclick={() => (settings.ribbon = r.id)}>
          <RibbonSwatch style={r.id} color="var(--danger)" small />{r.name}
        </Pill>
      {/each}
    </div>
  </div>

  <Segmented
    label="Bookmark views"
    options={[
      { value: "page", label: "By page" },
      { value: "coll", label: "By collection" },
    ]}
    bind:value={view}
  />

  <div class="list">
    {#if !bookmarks.items.length}
      <p class="text-body">No ribbons yet. Label this page above, or press B while reading.</p>
    {/if}
    {#each groups as g (g.name)}
      {#if g.name}<h4 class="text-label group-name">{g.name}</h4>{/if}
      {#each g.items as b (b.page)}
        {@const c = collectionById(b.coll)}
        <div class="item">
          <button type="button" class="bm" onclick={() => go(b)}>
            <RibbonSwatch style={settings.ribbon} color={c.color} />
            <span class="words"><span class="text-strong">{b.label}</span><span class="text-body">{c.name}</span></span>
            <span class="text-label page">p. {b.page + 1} →</span>
          </button>
          <button
            type="button"
            class="del"
            aria-label="Remove bookmark {b.label}"
            onclick={() => bookmarks.remove(b.page)}
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      {/each}
    {/each}
  </div>

  <p class="text-body note">{platform.storageNote}</p>
</Panel>

<style>
  form {
    display: contents;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h3,
  h4,
  p {
    margin: 0;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .group-name {
    margin: var(--space-3) var(--space-1) var(--space-1);
    color: var(--ink-soft);
  }
  .item {
    display: flex;
    align-items: center;
  }
  .bm {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) 14px;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--surface-muted);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .bm:hover {
    background: var(--surface-hover);
  }
  .words {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .page {
    color: var(--action);
    white-space: nowrap;
  }
  .del {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    margin-left: 6px;
    border: 0;
    border-radius: 14px;
    background: var(--surface-muted);
    cursor: pointer;
  }
  .del:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .note {
    margin-top: auto;
    font-size: var(--text-sm);
  }
</style>
