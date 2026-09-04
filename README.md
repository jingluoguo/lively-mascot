# lively-mascot

**English** · [简体中文](README.zh-CN.md)

> A zero-dependency SVG mascot engine with 40 emotions and five built-in characters.

Use it in chatbots, desktop pets, widgets, and AI assistants. Pick a character,
then drive its expression with `setEmotion(id)`.

**[Live demo](https://jingluoguo.github.io/lively-mascot/)**

<p align="center">
  <img src="src/doc/en/e1.png" width="370" alt="lively-mascot controls" />
  <img src="src/doc/en/e2.png" width="370" alt="lively-mascot emotion gallery" />
</p>

## Highlights

- 40 lifecycle, reaction, work, and extended emotion states.
- Built-in Sprout, Cat, Robot, Ghost, and Jelly characters.
- Pointer gaze, 2D/3D presentation, face variants, outline control, and CSS-variable themes.
- Framework-free API plus an optional `<lively-mascot>` custom element.
- Custom SVG/HTML models and native character renderers.

## Quick Start

Install the package:

```bash
npm install lively-mascot
```

```js
import { createMascot } from "lively-mascot";
import "lively-mascot/styles/core";
import "lively-mascot/styles/sprout"; // only the characters you use

const mascot = createMascot(document.querySelector("#slot"), {
  type: "sprout",
  size: 180
});

mascot.setEmotion("10"); // Happy
```

The complete `dist/lively-mascot.min.css` file is still available for CDN use. For package builds, import the shared core stylesheet and one stylesheet per character (`styles/cat`, `styles/robot`, and so on) to avoid shipping unused character rules.

Or load the browser bundle from jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jingluoguo/lively-mascot@master/dist/lively-mascot.min.css" />
<script src="https://cdn.jsdelivr.net/gh/jingluoguo/lively-mascot@master/dist/lively-mascot.min.js"></script>

<div id="slot"></div>
<script>
  var mascot = LivelyMascot.createMascot(document.querySelector("#slot"), {
    type: "cat",
    size: 180
  });
  mascot.setEmotion("10");
</script>
```

Pin a release tag such as `@v0.3.1` in production rather than using `@master`.

## Documentation

| Need | Read |
| --- | --- |
| API options, instance methods, and all emotion IDs | [API reference](docs/guide.md#api-reference) |
| React, Vue, plain HTML, Web Component, or modular source setup | [Integration guide](docs/guide.md#integration) |
| Importing a custom SVG/HTML model | [Custom models](docs/guide.md#custom-models) |
| Generating a model from an image with Codex | [Image model skill](docs/guide.md#image-model-skill) |
| Adding characters or emotions | [Extending the engine](docs/guide.md#extending-the-engine) |
| Building the distribution files | [Build from source](docs/guide.md#build-from-source) |

## Basic API

```js
mascot.setEmotion("20");               // Thinking
mascot.setViewMode("2d");
mascot.setFaceVariant("simple");
mascot.setTheme({ body: "#67d9ff" });
mascot.setOutlineVisible(false);
mascot.clearEmotion();
mascot.destroy();
```

Available characters: `sprout`, `cat`, `robot`, `ghost`, and `jelly`.

Emotion behavior tags are shared across all models and are exposed through
`data-mascot-behaviors`; models do not need to opt into individual emotions.
Model definitions use `rig` only for physical rig capability overrides such as
`rig: { hop: false }`.

Custom emotions must be registered before calling `setEmotion()`. Give each one a unique ID and at least one semantic behavior tag so model styles can react without depending on numeric IDs:

```js
import { defineEmotion } from "lively-mascot";

defineEmotion({
  id: "celebrating",
  name: "Celebrating",
  group: "reaction",
  behaviors: ["celebrating"],
  recipe: {
    parts: {
      body: "bounce",
      eyes: "happy",
      mouth: "smile",
      top: "perk",
      feet: "happy"
    }
  }
});

mascot.setEmotion("celebrating");
```

The live demo has a separate **Actions** tab. Its composer discovers the selected character's declared `parts.*.actions` at runtime, lets you combine those standard actions into a recipe, and applies the registered result immediately. New model parts and actions appear there automatically.

## Project Layout

```text
src/             Engine, rig, and built-in character renderers
skills/          Codex skill for image-to-mascot extraction
dist/            Generated browser and package bundles
index.html       Interactive demo
docs/            Integration, API, custom-model, and extension guide
```

## License

MIT
