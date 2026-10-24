<!--
  @component
  A labelled range slider with a chunky thumb.
  <Slider label="Dim" min={0} max={60} step={5} bind:value={settings.dim} />
-->
<script lang="ts">
  let {
    label,
    min,
    max,
    step = 1,
    value = $bindable(0),
  }: { label: string; min: number; max: number; step?: number; value: number } = $props();
  const id = $props.id();
</script>

<label for={id} class="text-body">{label}</label>
<input {id} type="range" {min} {max} {step} bind:value />

<style>
  label {
    font-size: var(--text-sm);
  }
  input {
    appearance: none;
    width: 100%;
    height: 10px;
    border-radius: var(--radius-round);
    background: rgba(255, 255, 255, 0.8);
    accent-color: var(--action);
    outline-offset: 6px;
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
