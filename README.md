# ✦ lively-mascot

**English** · [简体中文](README.zh-CN.md)

> Tamagotchi engine: 40 Emotions · Pure SVG · Zero Dependencies · Data-Driven · Drop-in.

A expression system for chatbots, desktop pets, web widgets, and AI assistants. Switch expressions with `setEmotion(id)` — each emotion drives independent body, leaf, foot, and facial animations.

**[Live Demo](https://jingluoguo.github.io/lively-mascot/)**

## Features

- **40 Status Emotions**: Covers lifecycle (sleep/idle), emotional reactions (happy/angry), work states (thinking/searching), and extended states (bored/nervous/eureka/waiting).
- **Full-Element Control**: Each emotion controls eyes, mouth, blush, body, leaf, and feet — 6 independent animation channels.
- **Configuration Driven**: Each emotion is a pure data combination (animations + filters + behavior params), supporting runtime registration.
- **Zero Dependencies, Zero Build**: Native JS, no framework, a single `<script>` tag.
- **Plug-and-play**: Web Component `<lively-mascot>` and functional API `createMascot`.
- **Gaze Tracking**: Eyes follow the pointer smoothly; automatically pauses during emotions and resumes smoothly after.
- **Theming**: Multi-instance theme switching (`setTheme`), all styles via CSS variables.

## Quick Start

```html
<link rel="stylesheet" href="src/lively-mascot.css" />
<div id="slot"></div>
<script src="src/core/emotions.js"></script>
<script src="src/lively-mascot.js"></script>
<script>
  var m = LivelyMascot.createMascot(document.getElementById('slot'), {
    type: 'sprout', size: 180
  });

  // Switch emotion
  m.setEmotion('10'); // Happy
  m.setEmotion('20'); // Thinking
  m.clearEmotion();   // Back to idle
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

```js
function renderMyChar(rig, rigEl) {
  // Draw SVG and register moving parts
  rig.registerEye(eyeEl);
  rig.registerPupil(pupilEl, { maxX: 8, maxY: 6 });
  rig.registerLeaf(leafEl);
  rig.registerFeet(feetEl);
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
├── index.html              # Demo: Hero + Color/Emotion Tab panels
├── src/
│   ├── core/
│   │   ├── emotions.js     # Emotion definitions (pure data)
│   │   └── rig.js          # Animation engine
│   ├── lively-mascot.js    # Core SDK
│   └── lively-mascot.css   # Animation styles
├── package.json
└── README.md
```

## License

MIT
