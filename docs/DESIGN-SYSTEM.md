# Design system

Paper Book's look: **the book is the hero; the controls around it are bold, chunky and friendly.** Painterly pages, a geometric sans (Outfit, heavy weights), soft squircle corners, colour-blocked panels, and controls that feel physical when you press them.

Everything visual comes from `src/design/`. Change it there and the whole app follows.

## 1. Tokens (`src/design/tokens.css`)

Two layers:

- **Primitives** (`--pb-*`): raw values like `--pb-grey-100`. Rarely used directly.
- **Semantic tokens**: what components use. Themes override the first five.

| Token                                                           | Role                                               |
| --------------------------------------------------------------- | -------------------------------------------------- |
| `--ink`                                                         | Text, dark controls, pressed state                 |
| `--ink-soft`                                                    | Secondary text                                     |
| `--accent`                                                      | Highlight: page label text, Open PDF, cards, timer |
| `--accent-soft`                                                 | Lighter accent                                     |
| `--action`                                                      | Page arrows, selected tabs, switches, focus ring   |
| `--on-ink`                                                      | Text on dark                                       |
| `--surface` / `--surface-muted` / `--surface-hover`             | Panels; pills and rows; hover                      |
| `--line`, `--danger`, `--danger-soft`, `--info-soft`, `--paper` | Dividers, delete, info card, page colour           |

Type: `--font-ui` (Outfit), weights `--weight-body` 500 / `--weight-label` 700 / `--weight-heavy` 800, sizes `--text-xs` … `--text-display`.

Space: `--space-1` … `--space-8` on a 4 px grid. Radius: `--radius-sm` 12 → `--radius-2xl` 32 and `--radius-round`. Sizes: `--control-sm` 44 (minimum touch target) → `--control-xl` 64; icons `--icon-sm/md/lg`.

Depth: `--shadow-sm/md/lg` and `--lip` / `--lip-dark` (the chunky bottom edge on pressable things). Layers: `--z-scene` → `--z-effects`. Motion: `--ease-spring`, `--ease-out`, `--ease-soft`, `--dur-fast/base/slow/theme`.

**Rule:** components never contain hex colours, pixel radii or ad-hoc shadows. Missing a value? Add a token.

## 2. Text styles (`src/design/base.css`)

| Class           | Use                             |
| --------------- | ------------------------------- |
| `.text-display` | The big clock                   |
| `.text-title`   | Panel titles                    |
| `.text-heading` | Card titles                     |
| `.text-label`   | Section labels, small bold text |
| `.text-strong`  | List item titles, switch titles |
| `.text-body`    | Explanations (soft ink)         |
| `.sr-only`      | Screen-reader-only text         |

## 3. Components (`src/design/components/`)

Import from one place: `import { Button, Panel } from "$design/components";`

| Component     | What it is                                                                 | Key props                                                           |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `Button`      | The one button: `surface`, `dock`, `open`, `primary`, `edge` (round arrow) | `variant`, `icon`, `iconAct`, `label`, `iconOnly`, `tip`, `pressed` |
| `CloseButton` | Square close for panels; spins on hover                                    | `label`, `onclick`                                                  |
| `Pill`        | Small choice/toggle, optional colour dot                                   | `pressed` or `role="radio"` + `checked`, `swatch`, `tone`           |
| `Segmented`   | Joined options: `tabs` (views) or `choice` (values)                        | `options`, `bind:value`, `kind`                                     |
| `Switch`      | Setting row with a sliding switch                                          | `title`, `description`, `bind:checked`                              |
| `Slider`      | Labelled range                                                             | `label`, `min`, `max`, `step`, `bind:value`                         |
| `Field`       | Labelled text input                                                        | `label`, `bind:value`, `focusKey`                                   |
| `Panel`       | Floating sheet that pours in; `left`, `right` or `watch` placement         | `title`, `subtitle`, `placement`, `onclose`                         |
| `Card`        | Colour block inside a panel: `accent` or `info`                            | `tone`, `title`                                                     |
| `Tile`        | Pickable tile for grids (scenes, themes, watches)                          | `pressed`, `layout`, `preview` snippet                              |
| `Toast`       | Short message at the top                                                   | `message` (use `toast()` from `$stores/ui.svelte`)                  |
| `Icon`        | Stroke icon by name from `icons.ts`                                        | `name`, `size`, `act`                                               |

## 4. Motion and feel

- **`use:feel`** (`actions/feel.ts`): jelly squash on release, pop ring when something switches on, optional magnetic lean toward the mouse, a soft bloop when page sound is on, an 8 ms buzz on touch. Built into Button, Pill, Tile, Segmented and CloseButton.
- **`use:ripple`**: a water drop where you press.
- **`transition:pour`**: panels flood in from where you tapped.
- **Icon acts** (`act` prop): `drop`, `wiggle`, `rise`, `grow`, `shimmy`, `spin`. The icon acts out what the button does.
- **Theme change**: colours glide (registered `@property` tokens) while rings of the new colours spread from your tap.
- **Reduced motion**: `motion.css` switches all CSS motion off; JS animations check `reduceMotion` from `$lib/motion`.

## 5. How to…

**Add a colour theme.** Add a row to `THEMES` in `src/design/themes.ts`. It appears in the Scene panel automatically.

**Change the overall feel** (rounder, bolder, tighter). Edit the radius, weight or space tokens in `tokens.css`. Every component follows.

**Add an icon.** Add a 24×24 stroke path to `ICONS` in `components/icons.ts`, then `<Icon name="yours" />` or `<Button icon="yours" …>`.

**Add a button to the dock.** Add a `<Button variant="dock" iconOnly label=… tip=… />` in `src/layout/Dock.svelte`.

**Make a new component.** Put it in `components/`, use only tokens, give it `use:feel`/`use:ripple` if it's pressable, add an `@component` comment with an example, export it from `components/index.ts`, and list it in the table above.

**Add a scene.** Add a row to `SCENES` in `features/scenes/scenes.ts`, and optionally a drawing in `sceneArt.ts`.
