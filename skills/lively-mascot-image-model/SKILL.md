---
name: lively-mascot-image-model
description: Extract a supplied character image into a Lively Mascot model definition with explicit parts, skin slots, effect anchors, and scoped CSS. Use for 2D SVG/HTML mascot extraction, not GLB/GLTF/FBX.
---

# Lively Mascot Image Model

Turn one supplied image into a compact, rigged 2D model. Inspect the image directly; do not generate an intermediate image or require an API key. If there is no usable image, ask for one before writing files.

## Model Architecture

Every output uses `LivelyMascot.defineModel()`. Do not use SVG/HTML string imports, DOM marker scanning, or a separate importer route. The model definition must declare all of the following:

- `parts`: the anatomy it actually has and the actions each part supports.
- `skin`: theme slots (`body`, `outline`, `accent`) and identity colors that stay fixed as named color values.
- `effects`: supported shared effects and anchors in the 100 by 100 coordinate space.
- `render(model, container)`: creates artwork layers and calls `model.registerPart()` for every movable part.

Read [the model contract](references/model-contract.md) before writing output.

## Reference Confirmation

Before creating any output files, identify the pet or character and present a compact reference inventory to the user: its primary silhouette geometry, visible anatomy and identity details, plus standard anatomy for that identified subject which is obscured or absent from the image. Ask whether a missing or obscured structural part should be added only when a stylized addition can remain visually consistent with the reference and the selected native structure. For example, ask whether a cat with no visible tail should have a stylized tail.

Do not ask about unrelated invented features. Ask only about plausible anatomy for the identified subject or structure selected for the model. When adding a missing part would require a large visual departure from the reference, omit it directly and state that choice in the inventory; do not ask the user to choose a poor-fitting addition. If the user has already said to use only the visible reference, treat that as an instruction to omit all unobserved anatomy. Otherwise, pause generation only for viable additions until the user confirms whether to add or omit them. Record the user's decision, and any automatically omitted high-variance anatomy, in the generated `model.json` limitations.

Use the closest native structure as a source of behavior, not as a required anatomy list:

| Source anatomy | Native structure |
| --- | --- |
| bilateral animal with ears/paws | cat body, ears, shared face, user-confirmed tail, visible paws only |
| plant or botanical character | rounded body, leaf, shared face, feet |
| mechanical or appliance character | blocky body, antenna, shared face, feet |
| floating or sheet-like character | floating body and hem, no invented feet |
| rounded minimal subject | blob body and shared face, no invented appendages |

Do not automatically add ears, tails, antennae, leaves, hands, paws, or feet that the reference does not support. A user-confirmed addition may be included; otherwise omit it. When a generated model calls a native renderer, remove every omitted visual layer before the renderer returns and omit that part from `parts`, its manifest, and model-specific CSS. Never retain an absent feature merely to preserve the native silhouette or motion contract. Keep the neutral mass centered, vertically upright, and recognizable at 96 px.

## Parts, Expressions, And Effects

Use the standard structural part names `body`, `eyes`, `mouth`, `top`, `feet`, and `tail`. The shared `LivelyMascot.buildFaceSvg(model)` registers `face`, `eyes`, `pupils`, and `mouth` itself. Use `parts.accessory` with `model.registerPart("accessory", node)` for permanent details such as whiskers or a fixed badge. Use `accessories` and `model.registerAccessory(id, node)` only for optional, toggleable items such as glasses or hats. Declare only anatomy that exists: every `parts` entry must have a matching rendered node, and every rendered movable layer must be supported by the reference. The core emotion recipe safely omits missing parts.

When eyes, mouth, or markings are independent layers over a body artwork layer, apply whole-body motion to their shared parent rather than only the artwork layer. The complete visual face must travel, rotate, and scale with the body; reserve child transforms for local gaze and expression changes.

When the reference has only one facial vocabulary, such as two simple eyes with no mouth, eyebrows, or pupils, use that existing feature as the expression channel. For non-neutral eye actions, combine a clearly visible but restrained local change: move one or both eyes from their neutral position, vary their spacing or vertical alignment, and then use scale, tilt, or squash as a secondary cue. The expression must change at least one eye dimension by roughly 35-55% at thumbnail scale; attention states such as curious, surprised, or thinking may use a 55-75% animated change when the face has enough clear area. Do not invent a mouth or unrelated facial anatomy merely to make an emotion readable.

Give eyed models the shared face unless their anatomy requires a custom face. For a custom face, register the eye group through `model.registerPart("eyes", group, { gaze: { maxX, maxY, scale, depth } })` when the visible eyes should follow the cursor. Set `gaze: { scope: "eyes" }` on that model so only those groups move; do not disable `.lively-mascot__gaze` just to keep an upright body. Use the `--lively-gaze-x`, `--lively-gaze-y`, `--lively-gaze-scale`, and `--lively-gaze-depth` variables in the eye-group transform, preserving its centered base placement. When the reference conveys a turned face, prefer horizontal displacement plus very light horizontal compression (`depth` normally 0.04-0.1) over rotating the whole eye group; reserve `rotate` for references whose facial marks visibly keep a common tilt. The depth cue should stay subtle and the body remains stable. Choose a range that is visibly directional at the demo's thumbnail scale, normally about 35-55% of an eye's width horizontally and 20-35% of its height vertically; sparse two-eye faces may use up to 75% horizontally when their face has enough safe area. Give a sparse eye group a 24-35% maximum gaze scale when the surrounding face has room. For separate left/right eye nodes, register each with `gaze: { side: "left"|"right", sideScale: 0.06-0.1 }` and apply `scale: var(--lively-gaze-scale, 1)` (or the CSS `scale` property) so the eye toward the cursor narrows and the opposite eye opens subtly; keep the group-level scale for the shared overall enlargement. Test left, right, up, down, left-down, and right-down separately: diagonal and downward gaze must be visibly distinct from the neutral eye position. Keep pupils clipped inside the visible eye opening when pupils exist.

Declare `hearts`, `sparkles`, `sleep`, and `loading` when the character can accommodate those shared effects. Provide at least a `head` or `body` anchor. Do not implement emotion particles in model-scoped CSS: the core owns their lifecycle and rendering. Put pupils, markings, badges, and similarly identifying colors in `skin.fixed` as `{ name: "#color" }`; use the generated `--lively-fixed-<name>` variable in model CSS.

## Visual Requirements

Before drawing, make a compact visual measurement pass from the supplied reference. Record the subject's *visible* bounding box, width-to-height proportion, silhouette landmarks (apex, widest points, base, corner radius or side bulge), each facial feature's bounding box and placement relative to the subject, and the distribution of color, light, shadow, and edge softness. For a three-sided form, measure the apparent half-width at several heights; do not infer an equilateral or pointed triangle from its category. Treat a measured trait as reference-defining when a generic approximation would change recognition at the demo's thumbnail scale.

Reproduce the reference silhouette before adding surface treatment. A rounded triangle, rounded square, asymmetric blob, or other distinctive geometry must use a matching SVG path, mask, or equivalent independent artwork layer; do not substitute a generic circular or teardrop body. Match the measured proportions and feature placement, not only the named shape. For diffuse references, judge the blurred, visible contour rather than the raw SVG edge: size and soften the artwork so its apparent footprint and apex roundness match the reference at thumbnail scale. Build diffuse, low-contrast illumination from layered clipped color fields and a restrained outer glow or blur; do not reduce it to a crisp outline with a simple three-stop fill. Retain the project's compact scale and centered shadow while matching the reference's actual outline treatment. Reference-specific artwork must be scoped under `.lively-mascot--<slug>`.

For 3D-capable models, preserve the native layered body, face, and upper/lower feature structure. The neutral `02` frame must visibly differ between 2D and 3D through artwork layers, shadows, and depth, not a rectangular wrapper or an unintended lean. Neutral `02` keeps the complete body centered and upright with no residual rotation, skew, or directional horizontal shift. Non-neutral states may use controlled body or rig rotation, lateral movement, and scale when these clearly express the state and return cleanly to the neutral frame. An eyes-only gaze model may move its registered eye groups through the gaze variables above without moving the neutral body. Verify both the neutral reset and intentional non-neutral motion with `followCursor:false`.

## Deliverables And QA

Write these files under `outputs/lively-mascot-model/<slug>/` unless another path is requested:

- `model.js` defining the model with `defineModel()`.
- `model.css` for reference-specific artwork only.
- `model.json` with the declared parts, skin slots, effect anchors, the supported emotion IDs, and actual limitations.

Generated outputs are regeneration artifacts, not hand-tuned overrides. When a reusable behavior changes, update this skill (and any project workflow documentation) first, then regenerate the complete `model.js`, `model.css`, and `model.json` from the revised contract. Do not patch only one generated selector or numeric value to solve a single model review comment.

Add the generated CSS and renderer script to the project demo when the user asks to inspect the model. Run `node --check model.js`, build the project, and compare a neutral 2D screenshot at the reference's effective thumbnail scale before checking 3D frames with `followCursor:false`. In that comparison, explicitly verify silhouette proportions, facial feature scale and placement, and the color/light distribution; correct a reference-defining mismatch before treating the model as complete. Verify every registered emotion, face variants, outline visibility, independent theme slots, and the applicable shared particles. For cursor gaze, verify left, right, up, down, left-down, and right-down extremes separately. Confirm the mounted DOM and `parts` definition both omit unconfirmed anatomy and include any user-confirmed additions. Inspect the neutral `02` transforms for body, primary artwork layer, rig, and gaze: they must not contain a planar rotation, skew, or directional horizontal shift. Inspect non-neutral states separately to confirm any such motion is intentional and returns to neutral.
