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

Before creating any output files, identify the pet or character and present a compact reference inventory to the user: visible anatomy and identity details, plus standard anatomy for that identified subject which is obscured or absent from the image. Ask whether a missing or obscured structural part should be added only when a stylized addition can remain visually consistent with the reference and the selected native structure. For example, ask whether a cat with no visible tail should have a stylized tail.

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

Give eyed models the shared face unless their anatomy requires a custom face. For a custom face, register each eye and pupil through `model.registerPart()` and keep pupils clipped inside the visible eye opening.

Declare `hearts`, `sparkles`, `sleep`, and `loading` when the character can accommodate those shared effects. Provide at least a `head` or `body` anchor. Do not implement emotion particles in model-scoped CSS: the core owns their lifecycle and rendering. Put pupils, markings, badges, and similarly identifying colors in `skin.fixed` as `{ name: "#color" }`; use the generated `--lively-fixed-<name>` variable in model CSS.

## Visual Requirements

Retain the project's compact silhouette, solid fills, dark outline, restrained highlight, and centered shadow. Reference-specific artwork must be scoped under `.lively-mascot--<slug>`.

For 3D-capable models, preserve the native layered body, face, and upper/lower feature structure. The same locked-gaze neutral frame must visibly differ between 2D and 3D through artwork layers, shadows, and depth, not a rectangular wrapper or a rotated full model. The complete body remains upright in all 40 states; local ears, tail, leaf, antenna, or accessories may animate independently.

## Deliverables And QA

Write these files under `outputs/lively-mascot-model/<slug>/` unless another path is requested:

- `model.js` defining the model with `defineModel()`.
- `model.css` for reference-specific artwork only.
- `model.json` with the declared parts, skin slots, effect anchors, all 40 emotion IDs, and actual limitations.

Add the generated CSS and renderer script to the project demo when the user asks to inspect the model. Run `node --check model.js`, build the project, and compare 2D/3D frames with `followCursor:false`. Verify all 40 states, face variants, outline visibility, independent theme slots, cursor gaze extremes, and the applicable shared particles. Confirm the mounted DOM and `parts` definition both omit unconfirmed anatomy and include any user-confirmed additions.
