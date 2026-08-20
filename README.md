# ✦ lively-mascot

**English** · [简体中文](README.zh-CN.md)

> Tamagotchi engine: 40 Emotions · 5 Characters · Pure SVG · Zero Dependencies · Data-Driven · Drop-in.

An expression system for chatbots, desktop pets, web widgets, and AI assistants. Pick a character (Sprout / Cat / Robot / Ghost / Jelly) and switch expressions with `setEmotion(id)` — each emotion drives independent body, accessory, limb, and facial animations.

**[Live Demo](https://jingluoguo.github.io/lively-mascot/)**

## Features

- **40 Status Emotions**: Covers lifecycle (sleep/idle), emotional reactions (happy/angry), work states (thinking/searching), and extended states (bored/nervous/eureka/waiting).
- **Multi-Character**: Ships with five bundled characters — **Sprout** (plant-styled), **Cat** (pet-styled), **Robot** (tech blocky head + antenna), **Ghost** (domed floating translucent with a 3-lobe wavy hem), and **Jelly** (bouncy blob). Swappable via `type` option with zero engine-level changes.
- **Full-Element Control**: Each emotion controls eyes, mouth, blush, body, accessories (leaf/ears/tail), and limbs — independent animation channels per character anatomy.
- **Configuration Driven**: Each emotion is a pure data combination (animations + filters + behavior params), supporting runtime registration.
- **Zero Dependencies, Zero Build**: Native JS, no framework, standard `<script>` tag order.
- **Plug-and-play**: Web Component `<lively-mascot>` and functional API `createMascot`.
- **Gaze Tracking**: Eyes follow the pointer smoothly; automatically pauses during emotions and resumes smoothly after.
- **Theming**: Multi-instance theme switching (`setTheme`), all styles via CSS variables.

## Quick Start

```html
<!-- Core: engine styles + emotions data + SDK -->
<link rel="stylesheet" href="src/lively-mascot.css" />
<script src="src/core/emotions.js"></script>
<script src="src/core/rig.js"></script>
<script src="src/lively-mascot.js"></script>

<!-- Character styles + renderers (order doesn't matter among characters) -->
<link rel="stylesheet" href="src/characters/sprout.css" />
<link rel="stylesheet" href="src/characters/cat.css" />
<link rel="stylesheet" href="src/characters/robot.css" />
<link rel="stylesheet" href="src/characters/ghost.css" />
<link rel="stylesheet" href="src/characters/jelly.css" />
<script src="src/characters/sprout.js"></script>
<script src="src/characters/cat.js"></script>
<script src="src/characters/robot.js"></script>
<script src="src/characters/ghost.js"></script>
<script src="src/characters/jelly.js"></script>

<div id="slot"></div>
<script>
  // Sprout (plant mascot) — default
  var s = LivelyMascot.createMascot(document.getElementById('slot'), {
    type: 'sprout', size: 180
  });

  // Cat / Robot / Ghost / Jelly — same engine, different anatomy
  // var c = LivelyMascot.createMascot(c, {
  //   type: 'cat', size: 180
  // });

  // Switch emotion (same API across all characters)
  s.setEmotion('10'); // Happy
  s.setEmotion('20'); // Thinking
  s.clearEmotion();   // Back to idle
</script>
```

## API

### `createMascot(target, options)`

| Option         | Type      | Default    | Description               |
| -------------- | --------- | ---------- | ------------------------- |
| `type`         | `string`  | `"sprout"` | Character ID              |
| `color`        | `string`  | —          | Body color                |
| `outline`      | `string`  | —          | Outline / eye color       |
| `accent`       | `string`  | —          | Accent color (blush etc.) |
| `size`         | `number`  | `106`      | Container size in px      |
| `followCursor` | `boolean` | `true`     | Enable gaze tracking      |

**Returns**: `{ el, type, setTheme, setEmotion(id), clearEmotion(), destroy() }`

### Emotion Behaviors

Each emotion can configure:

| Field        | Description                                            |
| ------------ | ------------------------------------------------------ |
| `bodyAnim`   | Body CSS animation                                     |
| `bodyFilter` | Body filter (dim, grayscale, etc.)                     |
| `leafAnim`   | Leaf CSS animation                                     |
| `footAnim`   | Feet CSS animation                                     |
| `blink`      | `false` to disable blinking, `"fast"` for rapid blinks |
| `gaze`       | `false` to pause gaze tracking                         |

### Emotion ID Mapping

| Group           | ID    | Emotions                                                                                                                     |
| :-------------- | :---- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Lifecycle**   | 00-09 | Sleep · Wake · Idle · Breathe · Ready · Pause · Refresh · LowBattery · Offline · Boot                                        |
| **Reactions**   | 10-19 | Happy · Excited · Sad · Angry · Surprised · Shy · Love · Confused · Cool · Smug                                              |
| **Work States** | 20-31 | Thinking · Listening · Talking · Searching · Reading · Writing · Coding · Designing · Loading · Processing · Success · Error |
| **Extended**    | 32-39 | Grateful · Retrying · Cancelled · Crying · Bored · Nervous · Eureka · Waiting                                                |

## Extension Guide

### Registering a New Character

A character is just a `render(api, gazeEl)` function that draws its DOM and registers moving parts with the rig **api**. The gaze wrapper `gazeEl` is where every part is appended, so the whole character leans/turns together with the body posture.

```js
function renderMyChar(rig, gazeEl) {
  // 1. Body — must be appended to gazeEl and registered
  var body = document.createElement('div');
  body.className = 'lively-body lively-body--myChar';
  rig.registerBody(body);

  // 2. Face — reuse the shared, emotion-aware face builder
  //    (eyes / pupils are wired internally; do NOT register them by hand)
  var face = LivelyMascot.buildFaceSvg(rig);
  body.appendChild(face.wrap);

  // 3. Optional top decoration (leaf/ears/antenna) → registerLeaf
  //    Pass { useLeafAnim: false } to drive its motion via your own CSS.
  //    rig.registerLeaf(decoEl, { useLeafAnim: false });

  // 4. Optional bottom channel (feet / tail / hem) → registerFeet
  //    rig.registerFeet(feetEl);

  gazeEl.appendChild(body);
}
LivelyMascot.registerCharacter('myChar', renderMyChar, 'My Char');
```

### Registering New Emotions

```js
LivelyMascot.emotions['50'] = {
  id: '50', name: 'Custom', group: 'custom', desc: 'Custom',
  bodyAnim: 'my-custom-anim 1s ease-in-out',
  leafAnim: 'my-leaf-anim 1s ease-in-out',
  footAnim: 'my-foot-anim 1s ease-in-out',
};
```

## Project Structure

```
lively-mascot/
├── index.html                  # Demo: Hero + Color/Emotion + Character switcher
├── src/
│   ├── core/
│   │   ├── emotions.js         # 40 Emotion definitions (pure data)
│   │   └── rig.js              # Animation engine (gaze / blink / hop / emotion state)
│   ├── characters/
│   │   ├── sprout.js / .css    # Sprout  (plant: body + leaf + feet)
│   │   ├── cat.js    / .css    # Cat     (pet: body + ears + tail + paws)
│   │   ├── robot.js  / .css    # Robot   (blocky head + antenna + mech feet)
│   │   ├── ghost.js  / .css    # Ghost   (domed translucent body + in-body 3-lobe hem)
│   │   └── jelly.js  / .css    # Jelly   (translucent bouncy blob, no leaf/feet)
│   ├── lively-mascot.js        # Core SDK (character registry + createMascot)
│   └── lively-mascot.css       # Engine-level styles (structure + emotion selectors)
├── package.json
└── README.md
```

## License

MIT
