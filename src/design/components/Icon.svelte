<!--
  @component
  A stroke icon from icons.ts. `act` makes it act out its job when its button is hovered.
  <Icon name="bookmark" act="drop" />
-->
<script lang="ts">
  import { ICONS, type IconAct, type IconName } from "./icons";

  interface Props {
    name: IconName;
    size?: "sm" | "md" | "lg";
    act?: IconAct;
    stroke?: number;
  }
  let { name, size = "md", act, stroke = 2.2 }: Props = $props();
</script>

<svg class="icon {size} {act ? `pb-act-${act}` : ''}" viewBox="0 0 24 24" stroke-width={stroke} aria-hidden="true"
  >{@html ICONS[name]}</svg
>

<style>
  .icon {
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sm {
    width: var(--icon-sm);
    height: var(--icon-sm);
  }
  .md {
    width: var(--icon-md);
    height: var(--icon-md);
  }
  .lg {
    width: var(--icon-lg);
    height: var(--icon-lg);
  }
</style>
