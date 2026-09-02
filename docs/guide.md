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

### Runtime SVG and HTML

`registerModel()` accepts SVG or HTML markup and sanitizes it before cloning it for each instance:

```js
const markup = await file.text();
LivelyMascot.registerModel("user-model", markup, { name: file.name });

LivelyMascot.createMascot(container, {
  type: "user-model",
  size: 160,
  viewMode: "2d"
});
```

Use `data-lively-body`, `data-lively-leaf`, `data-lively-feet`, `data-lively-eye`, `data-lively-pupil`, and `data-lively-face` for rigged parts. Set `data-max-x` and `data-max-y` on pupils to adjust their gaze range. Style user model states through selectors such as `.lively-mascot.is-emotion-10`.

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

Register a character renderer and add moving layers to the rig:

```js
function renderMyCharacter(rig, gazeEl) {
  var body = document.createElement("div");
  body.className = "lively-body lively-body--my-character";
  rig.registerBody(body);

  var face = LivelyMascot.buildFaceSvg(rig);
  body.appendChild(face.wrap);
  gazeEl.appendChild(body);
}

LivelyMascot.registerCharacter("my-character", renderMyCharacter, "My Character");
```

Optional layers use `rig.registerLeaf(element, options)`, `rig.registerFeet(element)`, and `rig.registerFaceAccessory(name, element)`. Add a custom emotion with:

```js
LivelyMascot.emotions["50"] = {
  id: "50",
  name: "Custom",
  group: "custom",
  desc: "Custom",
  bodyAnim: "my-custom-animation 1s ease-in-out"
};
```

## Build from Source

```bash
npm install
npm run build
```

The build regenerates `dist/lively-mascot.min.js` and `dist/lively-mascot.min.css`. Run it after changing files under `src/`.
