# Model Contract

Every mascot is registered through `LivelyMascot.defineModel(definition)`. The definition is the only integration contract; SVG/HTML string import and DOM marker scanning are not supported.

The contract is sourced from the standalone repository at `https://github.com/jingluoguo/lively-mascot.git`. A skill installation is not a project checkout. Fetch that repository into a task-scoped directory before reading source files, checking the demo, or running `npm` commands, and keep generated outputs outside both the skill installation and the fetched checkout unless the user explicitly requests an integrated patch.

Generated model files are complete regeneration artifacts. Change reusable behavior in the skill contract first, then regenerate all of the model's `model.js`, `model.css`, and `model.json`; do not maintain one-off patches in generated output.

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
  gaze: { scope: "eyes" },
  rig: { hop: false },
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

`body`, `eyes`, `mouth`, `top`, `feet`, and `tail` are standard structural part names. The renderer calls `model.registerPart(name, element, options)` for every structural DOM layer it creates. `buildFaceSvg(model)` registers the shared face, eyes, pupils, and mouth automatically. Declare only visible reference anatomy or structural additions explicitly confirmed by the user. Omit missing anatomy directly when a plausible reconstruction would visibly depart from the reference. When reusing a native renderer, remove those omitted DOM layers rather than declaring them for compatibility, and record every decision in the generated manifest. When a body artwork and its face are sibling layers, animate their shared body parent for whole-body motion so the face stays visually attached; use child transforms only for local expression or gaze.

The body artwork must match the reference silhouette, including distinctive rounded polygon geometry. Before implementation, measure the subject's visible proportions, silhouette landmarks, facial feature boxes, and light/color field from the reference. For diffuse forms, match the apparent post-blur footprint and apex roundness at the demo thumbnail scale, rather than the sharp underlying SVG path or a generic interpretation of the subject category. Diffuse artwork must retain its soft layered color fields and low-contrast edges through clipped SVG/CSS layers and restrained blur, instead of becoming a hard-edged flat gradient. When the visible face has only one feature vocabulary, such as simple eyes without a mouth, use its declared part action to make a restrained but legible local change instead of adding new facial anatomy. For eye-only expressions, change the eyes' position or relation to one another before relying on scale or rotation. A sparse eye-only face changes at least one eye dimension by 35-55%; curious, surprised, and thinking may use a 55-75% animated change when there is enough clear face area. Custom visible eye groups can use `{ gaze: { maxX, maxY, scale, depth, rotate } }` with `gaze: { scope: "eyes" }`; their CSS applies the gaze variables to move and scale the eyes without moving the neutral body. For a turned-face reference, prefer shared horizontal translation plus subtle horizontal compression (`depth` normally 0.04-0.1); use shared rotation only when the source facial marks visibly maintain a common tilt. Sparse eye groups use 24-35% maximum gaze scale when the surrounding face has room. When the visible eyes are separate nodes, set `gaze.side` to `left` or `right` with a modest `sideScale` (normally 0.06-0.1) so the eye toward the cursor narrows while the opposite eye opens subtly; apply the variable through an independent CSS `scale` property so expression transforms continue to work. Test all cardinal and downward diagonal cursor positions, not just horizontal extremes. The neutral `02` frame must remain centered and upright with no residual planar rotation, skew, or directional horizontal shift. Non-neutral body or rig motion may rotate or move laterally when it is intentional, state-specific, and returns cleanly to neutral.

Use `parts.accessory` and `model.registerPart("accessory", element)` for permanent non-structural details such as whiskers, a fixed badge, or an always-worn item. These remain visible and receive shared `accessory` actions from emotion recipes.

Optional hats, glasses, and similar visual layers belong in `accessories`. Declare their default state and supported actions, then call `model.registerAccessory(id, element)`. Instances toggle them with `setAccessory(id, enabled)`; enabled accessories receive the shared `accessory` action from an emotion recipe. Do not place permanent identity details in `accessories`.

The engine evaluates each emotion recipe against `parts`. An action is applied only when the model declares both that part and the requested action. This is how a floating model can omit feet while a feline model uses ears and tail without requiring model-specific emotion code.

Actions are composable primitives, not emotion names. Reuse `LivelyMascot.partActions.<part>` when declaring supported actions and combine them in a custom emotion's `recipe.parts` with at most one action per part. Model CSS receives the selected action through `data-mascot-action-<part>`; selectors for alternative visual states must hide non-selected alternatives so replacements do not stack. Do not create a parallel action list or use numeric emotion IDs as the action contract.

## Semantic Behaviors And Rig Capabilities

Emotion definitions own semantic `behaviors` such as `happy`, `angry`, `loading`, or `eureka`. The runtime exposes the active tags uniformly through `data-mascot-behaviors` for every model. A model does not whitelist individual emotion tags; model CSS may react to any relevant tag or ignore it when no model-specific treatment is needed.

The model definition uses `rig` only for physical capabilities of the shared animation rig:

```js
rig: { hop: false }
```

The available capabilities are `blink`, `gaze`, `hop`, and `spin`, all enabled by default. Set a capability to `false` only when the model cannot physically support that shared motion. Do not encode these capabilities in `behaviors`, and do not use numeric emotion IDs to decide whether a model supports an expression.

## Skin And Effects

`skin.slots` names themes controlled by `setTheme()`. `skin.fixed` maps identity color names to their fixed values. The engine exposes each as `--lively-fixed-<name>` and never accepts it through `setTheme()`.

`effects.supported` and `effects.anchors` opt a model into shared particles. Anchors use percentages of the mascot square. The core currently provides `hearts`, `sparkles`, `sleep`, and `loading`; unsupported effects are skipped safely.
