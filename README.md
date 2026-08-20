# ✦ lively-mascot

**English** · [简体中文](README.zh-CN.md)

> Animated mascots for chatbots, desktop pets & web widgets — they blink, breathe, follow your cursor, and express emotions.

Drop a mascot into any page and it comes alive: it blinks, breathes, sways, taps its feet, hops when nobody's looking — and its eyes follow your cursor. Click it and it cheers up. **No build step. No npm install.** Just a `<script>` tag.

## Features

- **No dependencies, no build** — a single `lively-mascot.js`. Works from `file://`, a CDN, or any bundler.
- **Drop-in anywhere** — vanilla JS core + optional `<lively-mascot>` Web Component. Drop it into plain HTML, Vue, Svelte, Angular, WordPress, Electron, or Tauri.
- **Alive out of the box** — breathing, blinking, swaying, foot-tapping, sprout-swinging, random hops, and a click-to-cheer reaction. CSS keyframes + a tiny rAF rig.
- **Cursor-aware** — eyes (and the whole body) smoothly track the pointer.
- **Themeable** — recolor with `color` / `outline` / `accent`; the styling runs on CSS variables.
- **One call to swap characters** — `type: "sprout"` today, more coming.

## Usage

### Option A — script tag (any static page)

Copy `src/lively-mascot.js` and `src/lively-mascot.css` next to your HTML, then:

```html
<link rel="stylesheet" href="lively-mascot.css" />
<div id="slot"></div>
<script src="lively-mascot.js"></script>
<script>
  LivelyMascot.createMascot(document.querySelector("#slot"), {
    type: "sprout",
    color: "#48ff42",
    size: 120,
    onClick: () => console.log("hi!"),
  });
</script>
```

Open the file directly in a browser — no server needed.

### Option B — Web Component (no JS wiring)

```html
<script src="lively-mascot.js"></script>
<script>
  LivelyMascot.defineMascotElement("lively-mascot");
</script>

<!-- then anywhere in your markup: -->
<lively-mascot type="sprout" color="#6ec7ff" size="96"></lively-mascot>
```

`<lively-mascot>` attributes: `type`, `color`, `outline`, `accent`, `size`, `follow-cursor` (`"false"` to disable), `hop-interval` (`"6,13"` seconds, or `""` to disable). The element emits a `mascot-click` event on click, or set `el.onMascotClick = ...` in JS.

### Option C — from a CDN

```html
<link rel="stylesheet" href="https://unpkg.com/lively-mascot@0.1.0/src/lively-mascot.css" />
<script src="https://unpkg.com/lively-mascot@0.1.0/src/lively-mascot.js"></script>
```

## API

### `createMascot(target, options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string` | `"sprout"` | Character ID. |
| `color` | `string` | `#48ff42` | Body color (CSS var `--lively-body`). |
| `outline` | `string` | `#080808` | Outline / eyes / shadow ink (CSS var `--lively-outline`). |
| `accent` | `string` | `#ff9fb6` | Accent color, e.g. blush (CSS var `--lively-accent`). |
| `size` | `number` | `106` | Container size in px. |
| `followCursor` | `boolean` | `true` | Whether eyes/body track the pointer. |
| `hopInterval` | `[number, number] \| null` | `[6, 13]` | Random hop interval in seconds; `null` disables. |
| `onClick` | `() => void` | — | Called when the mascot is clicked (the happy reaction plays too). |

**Returns** an instance: `{ el, type, setTheme(partial), setFollowCursor(bool), setHopInterval(interval), click(), destroy() }`.

```js
const m = LivelyMascot.createMascot(document.body, { type: "sprout", size: 140 });
m.setTheme({ color: "#ff9fb6" }); // recolor at runtime
m.setFollowCursor(false);         // stop tracking the cursor
m.click();                         // trigger the happy reaction
m.destroy();                       // remove from DOM, free listeners/timers
```

### `registerCharacter(id, render, name?, viewBox?)`

Add a new character without touching the core. `render(rig, hostSvg)` draws the SVG and registers moving parts via `rig.registerPupil / registerEye / registerFace`.

```js
function renderCat(rig, host) {
  // ...draw an <svg class="lively-character"> into host...
  rig.registerEye(eyeEl);
  rig.registerPupil(pupilEl, { maxX: 7, maxY: 5 });
}
LivelyMascot.registerCharacter("cat", renderCat, "Cat");
// then: createMascot(el, { type: "cat" })
```

### `defineMascotElement(tag?)`

Registers the `<lively-mascot>` custom element (default tag `lively-mascot`). Safe to call repeatedly.

## Custom characters

A character is a renderer that builds the mascot's DOM into `rigEl` and registers moving parts on the `rig` API:

- **Body** `<div class="lively-body">` — a rounded sticker block (outline + offset shadow). Gets sway + squish for free.
- **Leaf / sprout** — any element with class `lively__leaf`; style it for idle sway (`.is-happy` spins it).
- **Eyes** `<g class="lively-face__eye">` — register with `rig.registerEye` → blink for free.
- **Pupils** `<g>` inside each eye, clipped by a `clipPath` — register with `rig.registerPupil(el, { maxX, maxY })` → cursor gaze for free.
- **Face** `<g class="lively-face">` — register with `rig.registerFace` → subtle tilt with gaze (optional). Usually wrapped in a `.lively-face-wrap` div over the body.
- **Feet** `<div class="lively__feet">` with two `◡` spans — style `.lively__foot--l/--r` for tap / kick / tuck.

Theme colors must be referenced through the CSS variables `--lively-body`, `--lively-outline`, `--lively-accent` — never hardcoded. See `src/lively-mascot.js` → `renderSprout` for a complete example.

## Demo

Open `index.html` in a browser (no server required) to see the function API and the Web Component side by side.

## Roadmap

- [ ] More built-in characters (cat, star, blob, …)
- [ ] `mood` — `happy` / `thinking` / `sleepy` states
- [ ] Floating-assistant helper (`position: fixed` wrapper)

## License

MIT
