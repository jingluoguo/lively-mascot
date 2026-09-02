# Model Action Catalog

This is the integration catalog for model actions. `LivelyMascot.partActions` remains the runtime source of truth; this document defines its semantics.

## Declaring Actions

```js
var actions = LivelyMascot.partActions;
LivelyMascot.defineModel({
  id: "my-model",
  parts: {
    body: { actions: actions.body },
    eyes: { actions: actions.eyes },
    mouth: { actions: actions.mouth },
    top: { actions: ["idle", "perk", "droop"] }
  }
  // ...
});
```

Declare only real anatomy and actions the model can express. The runtime safely skips unavailable parts or actions.

## Standard Actions

| Part | Actions | Meaning |
| --- | --- | --- |
| `body` | `idle`, `breathe`, `wake`, `rest` | neutral, breathing, wake, rest |
| `body` | `bounce`, `shake`, `pulse`, `work`, `dim`, `refresh` | joy, agitation, affection, work, low energy, refresh |
| `eyes` | `open`, `closed`, `happy`, `wide`, `sad` | open, closed, joyful, wide, sad |
| `eyes` | `angry`, `love`, `thinking`, `bored`, `cry` | angry, affection, thinking, bored, crying |
| `mouth` | `neutral`, `smile`, `open`, `flat`, `frown`, `talk` | neutral, smile, open, flat, frown, talking |
| `top` | `idle`, `perk`, `droop`, `shake`, `listen`, `work` | neutral, perked, lowered, shake, listening, working |
| `feet` | `rest`, `step`, `stomp`, `happy` | rest, step, stomp, happy step |
| `tail` | `idle`, `happy`, `droop`, `puff`, `tuck` | neutral, wag, lowered, puffed, tucked |
| `accessory` | `idle`, `happy`, `alert` | neutral, happy, alert |

`top` covers ears, leaves, antennae, horns, and similar upper anatomy. `accessory` covers permanent non-structural identity details such as whiskers or a fixed badge. Declare it through `parts.accessory` and register it with `model.registerPart("accessory", node)`; it remains visible. Add a custom part only when its semantics are shared by multiple models or required by a defined product need.

## Generated Model Revisions

Models produced from a reference image are maintained by regeneration. When a review reveals a generally reusable extraction rule, update the project image-model skill first, then regenerate the complete `model.js`, `model.css`, and `model.json` for that model. Do not make a visual correction as a one-off patch to only the generated output. Rules that are specific to this repository's workflow belong in this document, not in the reusable skill.

## Toggleable Accessories

Declare hats, glasses, and similar optional items in `accessories`, then bind the rendered nodes explicitly:

```js
accessories: {
  glasses: { default: false, actions: ["idle", "alert"] },
  hat: { default: true, actions: ["idle", "happy"] }
},
render: function (model, container) {
  model.registerAccessory("glasses", glasses);
  model.registerAccessory("hat", hat);
}
```

Toggle each one independently with `mascot.setAccessory("glasses", true)`. More than one accessory may be enabled. `getAccessories()` reports their current state. A recipe action reaches only enabled accessories that declare that action; an undeclared ID throws so typos do not fail silently.

Do not declare inherent whiskers or always-worn items in `accessories`. Use `parts.accessory` and `model.registerPart("accessory", node)` for permanent details; they do not appear in `getAccessories()` and cannot be hidden through `setAccessory()`.

## CSS, Skins, And Maintenance

The runtime writes actions to the rendered element, for example `[data-mascot-part="top"][data-mascot-action-top="perk"]`. Accessories use `[data-mascot-accessory="glasses"][data-mascot-action-accessory="alert"]`. Put model-specific local motion behind those selectors. Put shared emotion intent in `src/core/emotions.js`, not in model-scoped `.is-emotion-XX` rules.

`skin.slots` can be changed through `setTheme()`. Put pupil colors, markings, badges, and other identity colors in `skin.fixed`, which maps a name to a fixed color. Each value is exposed as `--lively-fixed-<name>` and cannot be overridden through `setTheme()`.

Reuse an existing action before adding one. Add a new standard action only for reusable semantics, then update this catalog, the type contract, the emotion recipe, and an in-project model verification.
