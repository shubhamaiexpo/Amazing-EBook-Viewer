<!--
  @component
  A small CSS picture of a ribbon, for lists and the style picker. Mirrors the 3D ribbon art.
-->
<script lang="ts">
  import type { RibbonStyle } from "$engine/ribbonArt";
  let { style, color, small = false }: { style: RibbonStyle; color: string; small?: boolean } = $props();
</script>

<span class="rib {style}" class:small style:--c={color} aria-hidden="true"></span>

<style>
  .rib {
    flex: none;
    display: inline-block;
    filter: drop-shadow(1px 2px 1.5px rgba(0, 0, 0, 0.3));
  }
  .satin {
    width: 12px;
    height: 40px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--c) 70%, #000),
      var(--c) 25%,
      color-mix(in srgb, var(--c) 65%, #fff) 45%,
      var(--c) 60%,
      color-mix(in srgb, var(--c) 65%, #000)
    );
  }
  .tab {
    width: 18px;
    height: 30px;
    border-radius: 0 0 7px 7px;
    background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 80%, #000));
  }
  .tassel {
    width: 14px;
    height: 40px;
    background:
      radial-gradient(circle at 50% 78%, var(--c) 0 4px, transparent 5px),
      linear-gradient(90deg, transparent 5px, var(--c) 5px 9px, transparent 9px);
  }
  .small {
    height: 22px;
  }
  .small.tab {
    height: 18px;
  }
</style>
