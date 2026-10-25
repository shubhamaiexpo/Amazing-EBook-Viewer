<!--
  @component
  A labelled range slider with a chunky thumb. `ends` puts words under each end, e.g. ["Lighter", "Darker"].
  <Slider label="Dim" min={0} max={60} step={5} bind:value={settings.dim} />
-->
<script lang="ts">
  let {
    label,
    min,
    max,
    step = 1,
    value = $bindable(0),
    ends,
  }: { label: string; min: number; max: number; step?: number; value: number; ends?: [string, string] } = $props();
  const id = $props.id();
</script>

<label for={id} class="text-body">{label}</label>
<input {id} type="range" {min} {max} {step} bind:value />
{#if ends}
  <div class="ends text-body" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></div>
{/if}

<style>
  label {
    font-size: var(--text-sm);
  }
  input {
    appearance: none;
    width: 100%;
    height: 10px;
    border-radius: var(--radius-round);
    background: rgba(0, 0, 0, 0.1);
    accent-color: var(--action);
    outline-offset: 6px;
  }
  .ends {
    display: flex;
    justify-content: space-between;
    margin-top: calc(var(--space-2) * -1);
    font-size: var(--text-sm);
  }
  input::-webkit-slider-thumb {
    appearance: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--ink);
    border: 4px solid var(--surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
  input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--ink);
    border: 4px solid var(--surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
</style>
