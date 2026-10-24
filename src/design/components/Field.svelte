<!--
  @component
  A labelled text input. Pass `focusKey` and bump it to move focus here.
-->
<script lang="ts">
  let {
    label,
    value = $bindable(""),
    placeholder = "",
    maxlength = 60,
    focusKey = 0,
  }: { label: string; value: string; placeholder?: string; maxlength?: number; focusKey?: number } = $props();
  const id = $props.id();
  let input: HTMLInputElement | undefined = $state();
  $effect(() => {
    if (focusKey) input?.focus();
  });
</script>

<label for={id} class="text-body">{label}</label>
<input bind:this={input} {id} bind:value {placeholder} {maxlength} />

<style>
  label {
    font-size: var(--text-sm);
  }
  input {
    width: 100%;
    min-height: var(--control-lg);
    padding: 0 var(--space-4);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--surface);
    font: 600 var(--text-lg) var(--font-ui);
    outline: none;
  }
  input:focus-visible {
    outline: 3px solid var(--action);
  }
</style>
