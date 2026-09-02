---
name: lively-mascot-image-model
description: Extract a user-provided character image into a Lively Mascot-compatible SVG/HTML model with markers, scoped CSS, and import-ready files. Use for 2D SVG/HTML mascot extraction, not GLB/GLTF/FBX.
---

# Lively Mascot Image Model

Turn one supplied image into a compact, rigged 2D model that uses the project's native archetype renderer and its established 2D/3D presentation whenever the anatomy fits. Inspect the image directly; do not generate an intermediate image or require an API key. If there is no usable image, ask for one before writing files.

## Inspect and choose structure

Before drawing, inspect every built-in model in `src/characters/*.js` and its CSS. Choose the closest structure, but treat it as vocabulary rather than a template to copy:

| Archetype | Structural vocabulary |
| --- | --- |
| `sprout` | rounded body, top leaf, paired feet |
| `cat` | rounded feline body, optional ears, tail, whiskers, paired paws |
| `robot` | blocky body, optional antenna, paired feet |
| `ghost` | floating body and wavy hem, no feet |
| `jelly` | simple rounded blob, no required appendages |

Keep only source-supported details that improve recognition at thumbnail size. Do not add ears, tails, antennae, leaves, hands, forepaws, or feet merely because the chosen archetype has them. For a front-facing bilateral subject, draw distinct paired feet or paws on one baseline when lower limbs are present. Omit upper limbs unless requested.

Translate the reference into the project's visual language: clear silhouette, solid fills, dark outline, restrained highlight, and a compact centered shadow. The neutral body mass must be centered on x=50, vertically upright, and balanced at roughly 100 by 100 units. The SVG root, main body, and permanent artwork must not use rotation, skew, or a compensating translation. Keep asymmetrical markings as artwork, never as a reason to lean the character or cast a diagonal shadow.

Before authoring, write a short **reference card** in the work log: silhouette, bilateral landmarks, identity markings, and front-to-back order. For a reference with a central face, the usual order is `rear shell -> body/front silhouette -> ears or upper feature -> raised face -> eyes/muzzle -> paws or lower feature`. Do not mistake a photo's background, crop, text, furniture, or incidental objects for character anatomy. Model the subject's useful silhouette and the two or three visual traits that make it recognizable at 96 px; record anything hidden by the crop as an explicit omission rather than inventing it.

## Native renderer route

When the reference fits one of this repository's built-in archetypes, generate a **native character renderer** as the default output, not a `registerModel()` SVG import. Inspect the closest `src/characters/<archetype>.js` and its CSS, then write `model.js` in the same form:

```js
function renderUserModel(rig, rigEl) {
  // Native body, leaf/ears, shared face, and feet DOM layers.
}

LivelyMascot.registerCharacter("<slug>", renderUserModel, "<Name>", "0 0 100 100");
```

The upright-body and state-motion rules below apply equally to animal, plant,
mechanical, floating, and abstract uploads. Never infer a cat-specific fix from
the reference; select the archetype by anatomy and apply the same whole-body
axis check to the resulting native renderer.

Choose the native structure by source anatomy, not by a fixed animal class:

| Source anatomy | Native structure to generate |
| --- | --- |
| bilateral animal with ears/paws | `cat.js` structure: body, ears, shared face, optional tail, feet |
| plant or botanical character | `sprout.js` structure: body, leaf, shared face, feet |
| mechanical or appliance character | `robot.js` structure: body, antenna if present, shared face, feet |
| floating or sheet-like character | `ghost.js` structure: floating body and hem, omit feet |
| rounded minimal subject | `jelly.js` structure: blob body, simple face, no invented appendages |

Use `LivelyMascot.buildFaceSvg(rig)` for eyed characters unless the source anatomy genuinely needs a different face rig. Use the native `.lively-body`, `.lively__ears` / `.lively__leaf` / `.lively__antenna`, `.lively-face-wrap`, `.lively__feet`, and `.lively__foot` layers appropriate to the chosen structure, then place reference-specific markings as inert SVG decoration **inside the native body and behind the face**. This lets the existing SDK handle body motion, face depth, top-feature depth, foot depth, blink, cursor gaze, all emotions, and 3D exactly as it does for built-in characters.

The generated root has the user slug class (for example `lively-mascot--bicolor-cat`), so a native renderer must also add the selected archetype class to that same root (for example `lively-mascot--cat`). The renderer runs before `createMascot()` appends the rig to that root: find it immediately if available, then retry with `requestAnimationFrame` after mounting. This inheritance class activates built-in archetype geometry, local ear/tail/leaf/antenna motion, foot placement, face layering, and 3D layers. Verify the alias is present on the mounted `.lively-mascot` root. It is not, by itself, sufficient to guarantee upright body posture because core state definitions can set an inline generic animation.

Do not imitate the native renderer with a single imported SVG or an HTML stack of duplicated flat artwork. Never redraw or replace a built-in layer merely to expose `translateZ`. Reference-specific artwork must decorate the native structure instead of becoming the structure. A native renderer does not require `model.svg`, `data-lively-*` markers, custom 3D planes, or custom emotion CSS: its renderer and the shared SDK are the contract. Reserve `registerModel()` for subjects that cannot honestly use an existing archetype, and state that fallback in the manifest.

## SVG contract

**This section applies only to the `registerModel()` fallback.** Write `model.svg` as self-contained SVG with `viewBox="0 0 100 100"`, no external resources or executable content. Use these markers where the matching anatomy exists:

| Marker | Purpose |
| --- | --- |
| `data-lively-body` | exactly one main body group |
| `data-lively-face` | optional face group for gaze posture |
| `data-lively-eye` / `data-lively-pupil` | paired blink and gaze groups |
| `data-lively-leaf` | optional top decoration, including both ears as one group |
| `data-lively-feet` | optional feet, tail, or ghost hem channel |

For moving ears, put each outer ear and its curved inset inner ear in the same local group, with an origin at its base. Draw ears from the reference, not a generic tall triangle: match their height, width, outward flare, rounded or pointed tip, and visible inner-ear margin. Keep the neutral ear pair balanced without a permanent CSS rotation; asymmetry must come from the source silhouette. Face markings sit below the eye layer and never overlap the ears.

### Eye safety and emotion face rig

Treat gaze and expressions as separate contracts. Put each `[data-lively-pupil]` inside a stable local clip wrapper with `clip-path="url(#<eye-opening>)"`, and put every pupil, iris highlight, and sparkle inside that clipped wrapper. The marker itself may move; the clip wrapper must not share its runtime transform. The referenced clip path must match the visible eye opening, use local coordinates, and leave at least 1 unit of clearance at every edge after the declared `data-max-x` / `data-max-y` movement. Never rely on overflow or a CSS transform alone to contain a pupil. Check left, right, up, and down gaze extremes with the maximum declared values.

When an expression changes an eye's size, tilt, or position, transform the whole `[data-lively-eye]` group so the eye opening, pupil marker, highlights, and any alternate lid stay registered together. Do not transform only the eye shell or only the pupil. When an expression reveals an alternate mouth, eye, or lid, hide the default counterpart in the same rule; never leave a default mouth underneath an open, happy, sad, or waiting mouth.

The SVG face must include named, hidden-by-default primitives for the emotions the source anatomy can support: `sleep-eye`, `happy-eye`/lid, `open-mouth`, `flat-mouth`, `sad-mouth`, `angry-brow`, `heart-eye`, `cry-eye` plus `tear`, `star-eye`, `sweat`, `sparkle`, and `waiting-dots` where appropriate. Keep the normal eye/pupil/mouth as the default. For every `.is-emotion-00` through `.is-emotion-39` rule, explicitly choose a face treatment (default, blink/closed, widened, narrowed, happy, sad, angry, surprised, love, cry, offline, or a deliberate neutral variant) in addition to any body motion. Do not claim emotion coverage when a state only animates the body.

Visible emotion accessories must also move when their meaning calls for motion. For an eyed character, crying (`35`) needs animated tear descent with staggered timing or a looped local equivalent; nervous (`37`) needs an animated sweat drip or pulse. Apply the animation to the tear/sweat artwork group, not to the whole face or body. Similar rules apply to loading dots, sparkles, and source-supported accessories: a state-specific prop must animate locally when the built-in emotion communicates motion through it. Use model-prefixed keyframes and preserve `animated:false` / reduced-motion behavior.

## Motion contract

For a native renderer, scope only reference-specific overrides under `.lively-mascot--<slug>` and inherit shared body, 3D, face, and emotion behavior. The following custom-wrapper guard applies only to a `registerModel()` fallback. Generated fallback CSS must be scoped with the actual model selector `.lively-mascot--<slug>`; never use a generic `.lively-mascot--custom-model` root selector. `registerModel()` adds a transparent `.lively-body--custom-model` wrapper and the shared SDK can attach body animations to it. Start every fallback `model.css` with this guard:

```css
.lively-mascot.lively-mascot--<slug> .lively-body.lively-body--custom-model {
  animation: none !important;
  background: transparent;
  border: 0;
  box-shadow: none;
  filter: none;
}

.lively-mascot.lively-mascot--3d.lively-mascot--<slug> .lively-body.lively-body--custom-model::before,
.lively-mascot.lively-mascot--3d.lively-mascot--<slug> .lively-body.lively-body--custom-model::after {
  content: none !important;
  display: none !important;
}
```

The custom wrapper, SVG root, `[data-lively-body]`, and any full-body artwork wrapper are stable geometry. They must never rotate or skew, either permanently or in an emotion keyframe. This applies to **every** state `00` through `39`, including Idle, Wake, Refresh, Loading, and Error. Use centered `translateY`, `translateX`, `scale`, opacity, or color for full-body motion. Do not reuse shared `lively-*` body keyframes because some are designed for built-in anatomy and rotate the complete body.

For a native renderer, inspect both the selected archetype's actual body keyframes and the core emotion definitions before accepting the inherited motion. The mounted archetype class must provide the upright Idle and Sleep baseline; if the selected archetype does not, add a slug-scoped upright substitute for only those states. For any core `bodyAnim` or rig animation that rotates the complete model, add a narrowly scoped model-prefixed upright substitute for that state, preserving its vertical rhythm, centered scale, opacity, or non-directional filter. Do not replace every native state with one generic float: preserve built-in bounce, breathe, success, loading, and other non-rotational motion. The complete `.lively-body`, `.lively-mascot__rig`, and `.lively-mascot__gaze` layers must stay on the upright axis for every emotion; no generated state rule may add `rotate`, `skew`, or a rightward compensating translation to them. A 3D camera `rotateX`/`rotateY` on the shared gaze layer is allowed only when it is the same SDK posture used by the built-in comparison. Rotation belongs to local ears, tail, leaf, antenna, or accessories only. Compare all 40 generated states with `followCursor:false` and confirm the body's computed transform contains no rotation.

Rotation is allowed only for a genuine local part such as an ear, tail, leaf, antenna, or accessory, with a local transform origin. Do not apply a model CSS `!important` transform to the shared rig or gaze layers. Do not use an SVG root transform, a large background shape, pseudo-element plane, or shadow to counteract runtime posture.

3D must produce a visible, artwork-only difference from 2D even in a front-facing, static frame. Keep the wrapper and its pseudo-elements transparent and disabled, then recreate the visible hierarchy used by built-in characters on real, compositor-safe SVG planes: a body base/silhouette, a raised face or eye plane, and at least one raised top or lower feature such as ears, feet, tail, antenna, or leaf. A single root SVG with only inner `<g>` elements is not sufficient: browsers commonly flatten those groups before applying CSS `translateZ`, leaving only the SDK's overall camera tilt. For SVG models, use separate nested `<svg>` elements (or an equivalent HTML layer stack) for the independent planes, each with the same viewBox and explicit width/height, and put rig markers on the plane that owns them. Give independently transformed rig markers an inner artwork wrapper, then apply `translateZ` to the plane or inner wrapper so gaze and expression transforms are never overwritten. **Prefer the HTML layer stack only when it preserves the complete artwork:** use sibling positioned `<div>`/`<span>` layers containing the original SVG artwork fragments when browser flattening prevents depth; never replace a detailed source model with a simplified redraw merely to obtain separate layers. Keep `model.svg` as the portable SVG artifact, and make `model.js` register the same complete artwork (or a build-time split of it) so 2D remains visually identical to the SVG export.

### Non-negotiable 3D read for fallback imports

Native renderers inherit the established 3D layers from the selected built-in archetype and are verified by comparison with that archetype. The requirements below apply only when the skill has to use `registerModel()`.

Treat `translateZ` as support for perspective, not visual proof of depth. The 3D stylesheet must still communicate depth when the browser flattens SVG transforms or the view is nearly head-on. Build the cue from artwork that remains visible in a screenshot:

- Use one rear **depth-shell** whose silhouette is a darkened duplicate of the principal mass. In 3D it must be revealed on the lower and shadow-side edge by an offset of at least `3cqw` horizontally and `4cqw` vertically at the mascot root. Do not hide it behind the front plane, and do not substitute a generic rectangular backdrop.
- Move the front body plane toward the light side by at least `1.5cqw`; move the raised face plane by at least `2.5cqw` and a top/lower plane by at least `2cqw`. These are CSS container units, not one or two fixed pixels, so the separation remains legible at every supported size.
- Give the face plane and top/lower plane nonzero, distinct `translateZ` values. The face must sit in front of the body, and at least one element must sit in front of or behind the face. Preserve that order with separate nested `<svg>` planes and `transform-style: preserve-3d` on their immediate artwork owners.
- In 3D, enlarge and offset the ground shadow by at least 20% in width and 30% in height, and add directional drop shadows to the body, face, and one top/lower plane. In 2D, keep those shadows compact and neutral.
- Use a restrained light-side highlight or a face/muzzle inset where it follows the reference. Do not turn the whole model into a glossy card; the side wall, overlap, and cast shadows are the primary depth signals.

At the default 106 px mascot size with `followCursor:false`, the 3D neutral screenshot must show at least three of these independently visible cues: a side wall at least 3 px wide, a face/feature cast shadow, a separated ear/foot/tail shadow, an expanded directional ground shadow, or an overlap/occlusion edge absent in 2D. A 3D render that differs only through SDK rotation, saturation, a filter, `translateZ`, or a 1-2 px offset fails. Increase the artwork-plane offsets and retest instead of declaring it subtle by design.

Every 3D-capable generated SVG must also include a named hidden-in-2D depth-shell plane: a darker duplicate of the principal silhouette behind the body that is revealed only in 3D. In the 3D selector, project it by a deliberate local offset down and toward the scene's shadow side, while the front silhouette, face, ears, and feet receive their own scale-independent `cqw` offsets and `translateZ`. Add an enlarged, offset ground shadow plus face/feature drop shadows and highlights. These visible 2D projection cues are mandatory because CSS/SVG depth compositing may be flattened or viewed head-on. Keep each offset local to a feature plane; do not translate or rotate the root, custom wrapper, or complete model to fake depth. A single weak shadow or `translateZ` alone is insufficient. A 3D selector must never target only the transparent wrapper, and must not add a rectangle, opaque full-viewBox plane, or a body rotation. When a model owns its leaf/ear animation, register it with `useLeafAnim: false` so shared leaf keyframes cannot distort its local anatomy.

Do not override the SDK gaze/3D posture layer or set `--lively-depth-transform: none` on the generated root. The SDK supplies the shared camera behavior; generated CSS supplies the model-specific layer separation that makes it perceptible. Do not use compensating directional translations, whole-model rotations, or a model-scoped `!important` transform on the rig/gaze channel. Provide a model-scoped `.lively-mascot--3d` rule with at least two nonzero `translateZ` layers, a visible depth shell, and a matching `.lively-mascot--2d` baseline. Those depth rules must target the independent nested SVG/HTML planes, not just a parent `<g>` inside one flat SVG. Compare the same locked-gaze neutral frame in both modes: the 3D frame must visibly show a silhouette side wall, separated face/feature shadow, and enlarged directional ground shadow before pointer motion begins. If only the transparent wrapper changes, or depth is less apparent than the built-in silhouettes, the model is not 3D-compatible.

## SDK parameter compatibility

Generated models must respond to the public instance controls, not merely render under their default classes. Native renderers inherit the selected archetype's face variants and state behavior; their model-scoped CSS may only restyle reference-specific decoration. Fallback imports must add model-scoped CSS that maps the SDK root classes and theme variables to named artwork layers:

- `lively-mascot--2d` / `lively-mascot--3d`: 2D is the clean artwork baseline; 3D adds depth only to actual silhouette, ear, foot, and eye layers. Verify the two modes differ while no transparent wrapper plane appears.
- `lively-mascot--outline-hidden`: hide only the outer silhouette, ear, tail, antenna, leaf, or foot outline strokes. Keep eyes, nose, mouth, and other facial details readable, matching built-in behavior.
- `lively-mascot--face-default`, `lively-mascot--face-simple`, and `lively-mascot--face-dot`: include an expressive default eye plus hidden capsule-eye and dot-eye primitives in each eye group. The simple and dot selectors hide the default iris, pupil, muzzle, nose, mouth, and whiskers, then reveal the appropriate minimal eye primitive. The selected eye group must remain registered for blink and gaze. Emotion selectors must still be able to reveal the named sleep/happy/open/sad/angry/surprise/love/cry primitives when the default face variant is active.
- `--lively-body`, `--lively-outline`, and `--lively-accent`: apply these variables to named primary body, outer outline, and accent layers. Preserve a distinctive secondary marking when it is central to the reference; do not hard-code every color so `setTheme()` becomes ineffective.
- `.lively-mascot--static`: do not override the SDK's global reduced-animation behavior.

Do not use broad selectors that change another generated model or any built-in character. The model manifest must state which reference-specific colors remain fixed when theme variables change.

For native renderers, use the shared face, local features, and 3D layers; add only the slug-scoped upright state overrides that the core definitions actually require. Verify all 40 states against the selected archetype. Fallback imports must cover all emotion classes `.is-emotion-00` through `.is-emotion-39`. Group states with the same treatment where appropriate, but give every state a deliberate scoped rule. Use model-prefixed keyframes such as `lively-user-<slug>-breathe`; their full-body transforms must be limited to the safe properties above. Express rotation-heavy built-in states through a local feature or the shared overlay, not by turning the imported body.

## Deliverables and QA

Write these files under `outputs/lively-mascot-model/<slug>/` unless another project-local directory is requested:

- `model.js` native renderer module, required for the native route
- `model.css`
- `model.json` with the archetype, renderer route, all 40 emotion IDs in numeric order, and real limitations
- `model.svg`, only for the `registerModel()` fallback or when the user explicitly requests a portable SVG export

Do not create a standalone `model.html` unless the user explicitly asks for a separate preview. When the user asks to inspect a generated model in this project, add the generated CSS and native renderer script to the existing project demo, add the model to the demo's character selector, and use `useLeafAnim: false` where the renderer owns ears or other top-decoration animation. This temporary integration must leave existing models unchanged.

For a fallback import, run `scripts/validate_model.py model.svg model.css`. For a native renderer, run `node --check model.js` and compare it with the selected built-in archetype at thumbnail size in 2D and 3D with `followCursor:false`, checking all states `00` through `39`: body axis vertical, paired feet level, no rightward offset or lean, and no rectangular 3D tile. Capture the same neutral frame in both modes. A native renderer must use the same active body, face, top-feature, and foot layers as its selected archetype; do not add a separate custom 3D system. In the same locked-gaze state, switch outline visibility, default/simple/dot face variants, and each theme variable independently. Confirm each control changes its intended named layer without hiding facial details or overriding fixed identity markings. Re-enable gaze and test the four gaze extremes at declared maxima. Inspect sleep, happy, curious, surprised, confused, love, crying, nervous, and waiting specifically. Test an applicable local-feature state to confirm that ears, tail, leaf, or antenna rotate as complete local groups while the body remains upright.

Report the output path, archetype, markers, full emotion coverage, limitations, and the exact import snippet. State that the model was extracted directly from the supplied reference image without an intermediate generated image or API key.

For marker and manifest details, read [references/model-contract.md](references/model-contract.md).
