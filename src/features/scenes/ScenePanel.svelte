<!--
  @component
  Scene settings: colour theme, the room, your own wallpaper, where the light comes from, and switches.
-->
<script lang="ts">
  import { Card, Panel, Pill, Slider, Switch, Tile } from "$design/components";
  import ThemePicker from "$features/themes/ThemePicker.svelte";
  import { playPaper } from "$lib/sound";
  import { settings, wallpaper, type WallFit } from "$stores/settings.svelte";
  import { closePanels } from "$stores/ui.svelte";
  import { sceneById, SCENES } from "./scenes";
  import { chooseWallpaper } from "./wallpaper";

  const light = $derived(settings.light ?? sceneById(settings.scene).light);

  function pickScene(id: string) {
    settings.scene = id;
    settings.light = null;
    if (id === "wall" && !wallpaper.url) void chooseWallpaper();
  }

  const FITS: { id: WallFit; name: string }[] = [
    { id: "cover", name: "Fill" },
    { id: "contain", name: "Fit" },
    { id: "tile", name: "Tile" },
  ];
  const LIGHTS = [
    { id: -1, name: "Left" },
    { id: 0, name: "Above" },
    { id: 1, name: "Right" },
  ] as const;
</script>

<Panel title="Scene" subtitle="The book takes its light and shadow from here." placement="right" onclose={closePanels}>
  <div class="group">
    <h3 class="text-label">Colour theme</h3>
    <ThemePicker />
  </div>

  <div class="scenes">
    {#each SCENES as s (s.id)}
      <Tile pressed={s.id === settings.scene} onclick={() => pickScene(s.id)}>
        {#snippet preview()}<span class="thumb" style:background={s.thumb}></span>{/snippet}
        {s.name}
      </Tile>
    {/each}
  </div>

  {#if settings.scene === "wall"}
    <Card tone="info" title="Your wallpaper">
      <Pill onclick={() => chooseWallpaper()} style="align-self:flex-start">+ Choose an image</Pill>
      <span class="text-body">Fit</span>
      <div class="row">
        {#each FITS as f (f.id)}
          <Pill pressed={settings.fit === f.id} onclick={() => (settings.fit = f.id)}>{f.name}</Pill>
        {/each}
      </div>
      <Slider label="Soften" min={0} max={12} bind:value={settings.blur} />
      <Slider label="Dim" min={0} max={60} step={5} bind:value={settings.dim} />
    </Card>
  {/if}

  <div class="group">
    <h3 class="text-label">Light comes from</h3>
    <div class="row">
      {#each LIGHTS as l (l.id)}
        <Pill pressed={light === l.id} onclick={() => (settings.light = l.id)}>{l.name}</Pill>
      {/each}
    </div>
  </div>

  <Switch title="True colour" description="Keep the scene's tint off the pages." bind:checked={settings.trueColour} />
  <Switch
    title="Page sound"
    description="Soft paper sounds on each turn and a gentle bloop on buttons."
    bind:checked={settings.sound}
    onchange={(on) => playPaper(on)}
  />
</Panel>

<style>
  .group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h3 {
    margin: 0;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .scenes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .thumb {
    display: block;
    height: 64px;
    border-radius: var(--radius-md);
    background-size: cover;
    background-position: center;
  }
</style>
