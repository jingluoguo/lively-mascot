# ✦ lively-mascot

> Plug-and-play animated mascots for chatbots, desktop pets & web widgets — they blink, breathe, follow your cursor, and express emotions.

Drop a mascot into your app and it comes alive: it blinks, breathes, sways, taps its feet, hops around when nobody's looking — and its eyes follow your cursor. Click it and it cheers up. No animation library, no state manager, zero configuration.

## Features

- **Alive out of the box** — breathing, blinking, swaying, foot-tapping, sprout-swinging, random hops, and a click-to-cheer reaction. All animations are CSS keyframes + a tiny rAF rig; no dependencies.
- **Cursor-aware** — eyes (and the whole body) smoothly track the pointer.
- **Themeable** — recolor a mascot with two props (`color` / `outline`); the styling runs on CSS variables.
- **One line to swap characters** — `type="sprout"` today, more characters coming.
- **SSR-safe** — static SVG on the server, animations only engage in the browser. Works in Next.js / Remix out of the box.

## Install

```bash
npm install lively-mascot
```

React 18 or 19 is required (peer dependency).

## Quick start

```tsx
import { Mascot } from "lively-mascot";
import "lively-mascot/styles.css";

export function ChatBotAvatar() {
  return (
    <Mascot
      type="sprout"
      color="#48ff42"
      outline="#080808"
      size={106}
      onMascotClick={() => console.log("hi!")}
    />
  );
}
```

That's it — it blinks, breathes, follows the cursor, hops every few seconds, and cheers up when clicked.

## API

### `<Mascot />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `"sprout"` | `"sprout"` | Character ID. |
| `color` | `string` | `#48ff42` | Body color (CSS var `--lively-body`). |
| `outline` | `string` | `#080808` | Outline / eyes / shadow ink (CSS var `--lively-outline`). |
| `accent` | `string` | `#ff9fb6` | Accent color, e.g. blush (CSS var `--lively-accent`). |
| `size` | `number` | `106` | Container size in px. |
| `followCursor` | `boolean` | `true` | Whether eyes/body track the pointer. |
| `hopInterval` | `[number, number] \| null` | `[6, 13]` | Random hop interval in seconds; `null` disables. |
| `onMascotClick` | `() => void` | — | Called when the mascot is clicked (the happy reaction plays too). |
| `className` / `style` | — | — | Forwarded to the root element. |

Other `HTMLAttributes` (e.g. `title`, `id`) are forwarded to the root `<div>`.

## Custom characters (contributor guide)

Characters are pure SVG components — the rig gives them life for free. A character:

1. Renders **one `<svg className="lively-character">`** (pick your own `viewBox`, e.g. `0 0 100 100`).
2. Marks its **moving parts** with the rig's registration callbacks.
3. Registers itself in `src/mascots/index.ts`.

```tsx
import { useCallback, useId } from "react";
import type { CharacterProps } from "../../types";

export function CatView({ rig }: CharacterProps) {
  const clipId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const eyeL = useCallback((el: SVGGElement | null) => rig.registerEye(el), [rig.registerEye]);
  const pupilL = useCallback(
    (el: SVGGElement | null) => rig.registerPupil(el, { maxX: 7, maxY: 5 }),
    [rig.registerPupil],
  );

  return (
    <svg className="lively-character" viewBox="0 0 100 100">
      <defs>
        <clipPath id={clipId}>
          <ellipse rx="9" ry="10" />
        </clipPath>
      </defs>
      {/* body — sway + squish for free */}
      <g className="lively-body">
        <path d="..." fill="var(--lively-body)" stroke="var(--lively-outline)" strokeWidth="2" />
      </g>
      {/* eyes — blink + gaze for free */}
      <g transform="translate(34 44)">
        <g className="lively-face__eye" ref={eyeL}>
          <ellipse rx="9" ry="10" />
          <g clipPath={`url(#${clipId})`}>
            <g ref={pupilL}>
              <circle className="lively-face__pupil" r="5.5" />
            </g>
          </g>
        </g>
      </g>
      {/* happy mouth — swap on click for free */}
      <path className="lively-face__mouth" d="M42 62 Q50 68 58 62" />
      <path className="lively-face__happy-mouth" d="M40 60 Q50 73 60 60 Q50 65 40 60 Z" />
    </svg>
  );
}
```

```ts
// src/mascots/index.ts
export const mascots = {
  sprout: { id: "sprout", name: "Sprout", viewBox: "0 0 100 100", component: SproutView },
  cat: { id: "cat", name: "Cat", viewBox: "0 0 100 100", component: CatView },
};
```

Rig callbacks (from `useMascotRig`, or the `rig` prop):

| Callback | What it drives | Notes |
| --- | --- | --- |
| `registerEye(el)` | Blink (`scaleY` via `.is-blinking`) | Wrap each eye in a `<g className="lively-face__eye">`. |
| `registerPupil(el, { maxX, maxY })` | Cursor gaze (per-frame transform) | Overflow is clipped by your `clipPath`. |
| `registerFace(el)` | Subtle face tilt with gaze (optional) | |
| `happy` / `click()` | Happy reaction | Style via `.lively-mascot.is-happy`. |
| `hopping` | Random hop | Style via `.lively-mascot.is-hopping`. |

Shared CSS conventions you get for free: `.lively-body` (sway/squish), `.lively-face__eye` (blink), `.lively-face__happy` / `.lively-face__happy-mouth` (click cheer), `.lively-foot` (tap/kick/tuck), `.lively-sprout__sprout` (sway/spin). Theme colors must be referenced through the CSS variables `--lively-body`, `--lively-outline`, `--lively-accent` — never hardcoded.

## Roadmap

- [ ] More built-in characters (cat, star, blob, …)
- [ ] `mood` prop — `happy` / `thinking` / `sleepy` states
- [ ] Web Component wrapper (`<lively-mascot>`) for non-React hosts
- [ ] Native `@lively/core` API for Electron / Tauri desktop pets

## License

MIT
