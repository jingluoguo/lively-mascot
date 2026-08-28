# Model Contract

`LivelyMascot.registerModel(id, markup, options)` accepts a sanitized SVG or HTML fragment. The library clones the fragment for each mascot instance and wires optional DOM markers into its animation rig.

## Markers

| Marker | Cardinality | Rig behavior |
| --- | --- | --- |
| `data-lively-body` | zero or one | Documents the model's body region. The engine's transparent body channel still wraps the imported fragment. |
| `data-lively-eye` | zero or more | Receives the existing blink class. |
| `data-lively-pupil` | zero or more | Receives cursor-driven `transform`. Optional `data-max-x` / `data-max-y` override the default 8 / 6 range. |
| `data-lively-face` | zero or one | Receives the shared gaze rotation transform. |
| `data-lively-leaf` | zero or one | Registers the top decoration channel. Set `useLeafAnim: false` when CSS owns the animation. |
| `data-lively-feet` | zero or one | Registers the lower channel used by foot animations and filters. |

Equivalent CSS selectors can be supplied through `bodySelector`, `eyeSelector`, `pupilSelector`, `faceSelector`, `leafSelector`, and `feetSelector` options.

## Required SVG shape

```xml
<svg viewBox="0 0 100 100" role="img" aria-label="Model name">
  <g class="user-model__body" data-lively-body>
    <path class="user-model__silhouette" d="..." />
    <g class="user-model__face" data-lively-face>
      <g class="user-model__eye" data-lively-eye>
        <ellipse ... />
        <g class="user-model__pupil" data-lively-pupil data-max-x="6" data-max-y="5">
          <circle ... />
        </g>
      </g>
    </g>
  </g>
</svg>
```

Use local fragment IDs only. `registerModel` prefixes IDs per clone, but generated models should still avoid unnecessary IDs and never depend on document-global state.

## Manifest shape

```json
{
  "version": 1,
  "id": "user-model",
  "name": "User Model",
  "archetype": "cat",
  "viewBox": "0 0 100 100",
  "markers": {
    "body": 1,
    "face": 1,
    "eyes": 2,
    "pupils": 2,
    "leaf": 0,
    "feet": 1
  },
  "emotions": ["02", "10", "13", "14", "35", "28"],
  "limitations": []
}
```
