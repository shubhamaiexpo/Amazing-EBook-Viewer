<!--
  @component
  Watch panel: pick a watch, see the time and this session's reading, and set a reading timer.
-->
<script lang="ts">
  import { Panel, Segmented } from "$design/components";
  import { feel } from "$design/actions/feel";
  import { reader } from "$features/reader/reader.svelte";
  import { settings } from "$stores/settings.svelte";
  import { closePanels } from "$stores/ui.svelte";
  import { watchSVG, WATCHES } from "./faces";
  import { clock } from "./readingClock.svelte";

  const d = $derived(new Date(clock.now));
  const time = $derived(String(d.getHours()).padStart(2, "0") + "·" + String(d.getMinutes()).padStart(2, "0"));
  const date = $derived(d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
  const TIMERS = [
    { value: 15, label: "15" },
    { value: 30, label: "30" },
    { value: 60, label: "60" },
    { value: 0, label: "Off" },
  ];
  const chosen = $derived(clock.timerEnd ? clock.timerMins : 0);
</script>

<Panel title="Watch" placement="watch" onclose={closePanels}>
  <div class="styles">
    {#each WATCHES as w (w.id)}
      <button
        type="button"
        class="style"
        aria-pressed={settings.watch === w.id}
        onclick={() => (settings.watch = w.id)}
        use:feel
      >
        {@html watchSVG(w.id, true)}{w.name}
      </button>
    {/each}
  </div>
  <div class="center">
    <span class="text-display">{time}</span>
    <span class="text-body">{date}</span>
    <div class="stats">
      <div><span class="num">{clock.minutesRead}</span><span class="text-label soft">Minutes</span></div>
      <div><span class="num">{reader.pagesTurned}</span><span class="text-label soft">Pages turned</span></div>
    </div>
    <span class="text-label soft">Reading timer</span>
    <Segmented
      label="Reading timer"
      kind="choice"
      options={TIMERS}
      value={chosen}
      onchange={(m) => clock.setTimer(m)}
    />
    <span class="text-body note"
      >{clock.timerEnd ? `${clock.minutesLeft} min left` : "When time is up, the watch glows softly."}</span
    >
  </div>
</Panel>

<style>
  .styles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }
  .style {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px var(--space-1) var(--space-2);
    border: 2px solid transparent;
    border-radius: var(--radius-lg);
    background: var(--surface-muted);
    font: var(--weight-label) var(--text-xs) / 1 var(--font-ui);
    cursor: pointer;
    transition: transform var(--dur-fast) var(--ease-spring);
  }
  .style :global(svg) {
    width: 34px;
    height: 62px;
  }
  .style:hover {
    transform: translateY(-2px);
  }
  .style[aria-pressed="true"] {
    border-color: var(--ink);
    background: var(--surface);
  }
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    text-align: center;
  }
  .stats {
    display: flex;
    gap: var(--space-8);
  }
  .stats div {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .num {
    font: var(--weight-heavy) 30px / 1 var(--font-ui);
  }
  .soft {
    color: var(--ink-soft);
  }
  .note {
    font-size: var(--text-sm);
  }
</style>
