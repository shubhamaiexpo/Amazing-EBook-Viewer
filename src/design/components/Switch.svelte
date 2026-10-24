<!--
  @component
  An on/off setting row with a title, a line of explanation and a sliding switch.
  <Switch title="Page sound" description="Soft paper sounds on each turn." bind:checked={settings.sound} />
-->
<script lang="ts">
  let {
    title,
    description,
    checked = $bindable(false),
    onchange,
  }: { title: string; description?: string; checked: boolean; onchange?: (on: boolean) => void } = $props();
  const id = $props.id();
</script>

<label class="row" for={id}>
  <span class="words">
    <span class="text-strong">{title}</span>
    {#if description}<span class="text-body">{description}</span>{/if}
  </span>
  <input {id} type="checkbox" role="switch" bind:checked onchange={() => onchange?.(checked)} />
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    min-height: var(--control-sm);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--surface-muted);
    cursor: pointer;
  }
  .words {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  input {
    appearance: none;
    position: relative;
    flex: none;
    width: 52px;
    height: 30px;
    margin: 0;
    border-radius: var(--radius-round);
    background: var(--pb-grey-300);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: background 0.2s;
  }
  input::before {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    transition: transform var(--dur-base) var(--ease-spring);
  }
  input:checked {
    background: var(--action);
  }
  input:checked::before {
    transform: translateX(22px);
  }
</style>
