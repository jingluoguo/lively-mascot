# Model Contract

Every mascot is registered through `LivelyMascot.defineModel(definition)`. The definition is the only integration contract; SVG/HTML string import and DOM marker scanning are not supported.

## Definition

```js
LivelyMascot.defineModel({
  id: "user-model",
  name: "User Model",
  viewBox: "0 0 100 100",
  parts: {
    body: { actions: LivelyMascot.partActions.body },
    eyes: { actions: LivelyMascot.partActions.eyes },
    mouth: { actions: LivelyMascot.partActions.mouth },
    top: { actions: LivelyMascot.partActions.top },
    feet: { actions: LivelyMascot.partActions.feet },
    accessory: { actions: LivelyMascot.partActions.accessory }
  },
  skin: {
    slots: ["body", "outline", "accent"],
    fixed: { pupil: "#18222a", "identity-mark": "#f4e7d0" }
  },
  accessories: {
    glasses: { default: false, actions: ["idle", "alert"] }
  },
  effects: {
    supported: ["hearts", "sparkles", "sleep", "loading"],
    anchors: { head: { x: 50, y: 12 }, body: { x: 50, y: 58 } }
  },
  render: function (model, container) {
    // Create real DOM/SVG layers and register each movable part explicitly.
  }
});
```

## Parts

`body`, `eyes`, `mouth`, `top`, `feet`, and `tail` are standard structural part names. The renderer calls `model.registerPart(name, element, options)` for every structural DOM layer it creates. `buildFaceSvg(model)` registers the shared face, eyes, pupils, and mouth automatically. Declare only visible reference anatomy or structural additions explicitly confirmed by the user. Omit missing anatomy directly when a plausible reconstruction would visibly depart from the reference. When reusing a native renderer, remove those omitted DOM layers rather than declaring them for compatibility, and record every decision in the generated manifest.

Use `parts.accessory` and `model.registerPart("accessory", element)` for permanent non-structural details such as whiskers, a fixed badge, or an always-worn item. These remain visible and receive shared `accessory` actions from emotion recipes.

Optional hats, glasses, and similar visual layers belong in `accessories`. Declare their default state and supported actions, then call `model.registerAccessory(id, element)`. Instances toggle them with `setAccessory(id, enabled)`; enabled accessories receive the shared `accessory` action from an emotion recipe. Do not place permanent identity details in `accessories`.

The engine evaluates each emotion recipe against `parts`. An action is applied only when the model declares both that part and the requested action. This is how a floating model can omit feet while a feline model uses ears and tail without requiring model-specific emotion code.

## Skin And Effects

`skin.slots` names themes controlled by `setTheme()`. `skin.fixed` maps identity color names to their fixed values. The engine exposes each as `--lively-fixed-<name>` and never accepts it through `setTheme()`.

`effects.supported` and `effects.anchors` opt a model into shared particles. Anchors use percentages of the mascot square. The core currently provides `hearts`, `sparkles`, `sleep`, and `loading`; unsupported effects are skipped safely.
