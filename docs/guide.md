# Lively Mascot Guide

[简体中文](guide.zh-CN.md) · [README](../README.md)

## Integration

### React and Vue

Use the imperative API when application state drives expressions:

```jsx
import { useEffect, useRef } from "react";
import { createMascot } from "lively-mascot";
import "lively-mascot/dist/lively-mascot.min.css";

export function Mascot({ type = "sprout", size = 180 }) {
  const host = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    instance.current = createMascot(host.current, { type, size });
    return () => instance.current && instance.current.destroy();
  }, [type, size]);

  return <div ref={host} />;
}
```

In Vue, create the instance in `onMounted`, destroy it in `onBeforeUnmount`, and recreate it when `type` or `size` changes.

### Web Component

For declarative, idle-only use, register the element once:

```html
<script>
  LivelyMascot.defineMascotElement();
</script>

<lively-mascot type="cat" color="#ffd66b" size="180" view-mode="3d"></lively-mascot>
<lively-mascot type="ghost" color="#9be7ff" size="160"></lively-mascot>
```

The element rebuilds when `type`, `color`, `size`, `view-mode` (or `mode`), and `show-outline` change. It does not expose an instance; use `createMascot` for runtime emotion control.

### Modular Source Files

When serving source files directly, load the core before the characters:

```html
<link rel="stylesheet" href="src/lively-mascot.css" />
<link rel="stylesheet" href="src/characters/sprout.css" />
<link rel="stylesheet" href="src/characters/cat.css" />
<link rel="stylesheet" href="src/characters/robot.css" />
<link rel="stylesheet" href="src/characters/ghost.css" />
<link rel="stylesheet" href="src/characters/jelly.css" />

<script src="src/core/emotions.js"></script>
<script src="src/core/rig.js"></script>
<script src="src/lively-mascot.js"></script>
<script src="src/characters/sprout.js"></script>
<script src="src/characters/cat.js"></script>
<script src="src/characters/robot.js"></script>
<script src="src/characters/ghost.js"></script>
<script src="src/characters/jelly.js"></script>
```

## API Reference

### `createMascot(target, options)`

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `type` | `string` | `"sprout"` | Character ID |
| `color`, `outline`, `accent` | `string` | - | Theme colors |
| `size` | `number` | `106` | Square size in pixels |
| `followCursor` | `boolean` | `true` | Enable pointer gaze |
| `viewMode` / `mode` | `"2d" \| "3d"` | `"3d"` | Presentation mode |
| `outlineVisible` | `boolean` | `true` | Show outer silhouette ink |
| `animated` | `boolean` | `true` | Enable motion |
| `hopInterval` | `[number, number] \| null` | `[6, 13]` | Random-hop interval in seconds |
| `onClick` | `() => void` | - | Click handler |

The returned instance exposes:

```js
instance.el;
instance.type;
instance.viewMode;
instance.outlineVisible;
instance.setViewMode("2d");
instance.setOutlineVisible(false);
instance.setFaceVariant("default"); // "default" | "simple" | "dot"
instance.setTheme({ body: "#67d9ff", outline: "#17202a", accent: "#ffd6a5" });
instance.setEmotion("10");
instance.clearEmotion();
instance.destroy();
```

### Emotion IDs

| Group | IDs | States |
| --- | --- | --- |
| Lifecycle | `00-09` | Sleep, Wake, Idle, Breathe, Ready, Pause, Refresh, LowBattery, Offline, Boot |
| Reactions | `10-19` | Happy, Curious, Aggrieved, Angry, Surprised, Shy, Love, Confused, Cool, Smug |
| Work | `20-31` | Thinking, Listening, Talking, Searching, Reading, Writing, Coding, Designing, Loading, Processing, Success, Error |
| Extended | `32-39` | Grateful, Retrying, Cancelled, Crying, Bored, Nervous, Eureka, Waiting |

## Custom Models

See the [model action catalog](model-actions.md) for standard part actions and fixed-skin rules.

### Unified Model Definition

New models use `defineModel()` only. One definition declares the renderer, physical parts, skin slots, and effect anchors; runtime SVG/HTML imports and DOM marker scanning are not supported:

```js
var actions = LivelyMascot.partActions;
LivelyMascot.defineModel({
  id: "my-model",
  parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, mouth: { actions: actions.mouth } },
  skin: { slots: ["body", "outline", "accent"], fixed: { pupil: "#18222a", "identity-mark": "#f4e7d0" } },
  effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 12 }, body: { x: 50, y: 58 } } },
  render: function (model, container) {
    var body = document.createElement("div");
    body.className = "lively-body lively-body--my-model";
    model.registerPart("body", body);
    body.appendChild(LivelyMascot.buildFaceSvg(model).wrap);
    container.appendChild(body);
  }
});
```

`setEmotion()` resolves a shared recipe, then dispatches actions only to the parts declared by the current model. Missing parts are skipped. `setTheme()` changes only `skin.slots`; `skin.fixed` is mounted as immutable `--lively-fixed-<name>` CSS variables. Call `getCapabilities()` or `getSkin()` to inspect the contract.

Declare hats, glasses, and other toggleable items in `accessories`, then control them with `setAccessory(id, enabled)`. See the [accessory rules](model-actions.md#toggleable-accessories).

### Image Model Skill

The repository includes `skills/lively-mascot-image-model/`. Install it in your Codex skills directory, attach a reference image, and invoke:

```bash
cp -R skills/lively-mascot-image-model "${CODEX_HOME:-$HOME/.codex}/skills/"
```

```text
$lively-mascot-image-model
Turn this image into a lively-mascot character named "Fox".
```

The skill selects the closest native archetype when possible, preserving the project's built-in face, 2D/3D layers, and local feature motion. It writes output under `outputs/lively-mascot-model/<slug>/` and requires neither an API key nor an intermediate image.

Read the complete [model skill instructions](../skills/lively-mascot-image-model/SKILL.md) for the output contract.

## Extending the Engine

Register a model renderer and add moving layers through its runtime:

```js
function renderMyCharacter(model, gazeEl) {
  var body = document.createElement("div");
  body.className = "lively-body lively-body--my-character";
  model.registerPart("body", body);

  var face = LivelyMascot.buildFaceSvg(model);
  body.appendChild(face.wrap);
  gazeEl.appendChild(body);
}

LivelyMascot.defineModel({ id: "my-character", render: renderMyCharacter, parts: { body: { actions: LivelyMascot.partActions.body } } });
```

Optional layers use `model.registerPart("top", element)`, `model.registerPart("feet", element)`, and `model.registerPart("tail", element)`. Add a custom emotion with:

```js
LivelyMascot.emotions["50"] = {
  id: "50",
  name: "Custom",
  group: "custom",
  desc: "Custom",
  bodyAnim: "my-custom-animation 1s ease-in-out",
  recipe: {
    parts: { body: "bounce", eyes: "happy", mouth: "smile" },
    effects: [{ type: "sparkles", anchor: "head" }]
  }
};
```

## Build from Source

```bash
npm install
npm run build
```

The build regenerates `dist/lively-mascot.min.js` and `dist/lively-mascot.min.css`. Run it after changing files under `src/`.
