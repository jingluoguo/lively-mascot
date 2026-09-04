# Changelog

[简体中文](CHANGELOG.zh-CN.md)

All notable changes to this project are documented here.

## [0.3.1] - 2026-09-04

### Added

- Added default, simple, and dot face variants to generated custom-face models.

### Fixed

- Fixed minimal face variants so the default pupil and shine do not reappear over simple or dot eyes.

### Packaging and Documentation

- Added the image-model face-variant generation contract and QA guidance.
- Added the release preparation skill and documented face-variant support for generated models.

## [0.3.0] - 2026-09-04

Compared with `v0.2.0`, this release changes the extension and runtime contracts while retaining the existing characters, emotion set, and 2D/3D modes.

### Public API

- Replaced the old `registerCharacter()` / `characters` extension surface with declarative `defineModel()` / `models` definitions.
- Added model contracts for parts and actions, skin slots, fixed skin values, accessories, effect anchors, presentation metadata, and rig capability flags.
- Added `defineEmotion()` for custom string IDs and semantic `behaviors`; recipes now dispatch part actions and anchored effects.
- Added runtime inspection and control through `getCapabilities()`, `getSkin()`, `getAccessories()`, and `setAccessory()`.

### Runtime and Demo

- Added per-eye gaze tuning and model-versus-eyes gaze scope, with model-specific blink, gaze, hop, and spin capability handling.
- Added keyboard-accessible click interaction with `ariaLabel`, plus default theme restoration for each model.
- Added face variants, native color pickers, model default-color cards, and an action composer to the demo.
- Changed model loading to discover paired `*.model.js` / `*.model.css` files and expose per-character CSS imports.
- Runtime gaze, blinking, hopping, and timers now pause while the page is hidden or reduced motion is requested, then resume automatically.

### Packaging and Documentation

- Added ESM/CJS-specific TypeScript declaration entry points, Node.js engine metadata, and refined package side-effect declarations.
- Added the model/action integration guides and updated the image-to-model contract documentation.

## [0.2.0] - 2026-08-26

### Added

- Added a static rendering mode with `animated: false` for non-animated previews and thumbnails.
- Added 2D and 3D view modes with a lightweight CSS depth treatment, material highlights, and cursor-driven posture.
- Added `outlineVisible` / `setOutlineVisible()` and declarative `show-outline` support.
- Added interchangeable face accessory registration through `registerFaceAccessory()` and `setFaceAccessory()`.
- Added npm CommonJS and ESM entry points, browser CDN metadata, and TypeScript declarations.
- Added bilingual demo preview images and expanded the interactive demo controls.

### Changed

- Redesigned the Cat character with a charcoal palette, floating whiskers, updated facial details, and a rebuilt tail geometry.
- Improved 3D posture with pitch/yaw head turning, cursor-following highlights, and volume compensation at angled views.
- Moved the Cat tail behind the body in 3D mode and split its motion into layered animation channels.
- Reworked Loading to use a shared rotating ring and whole-rig bounce; softened global shadows and aligned foot filters with emotion state.
- Gated automatic hopping by emotion so it no longer interrupts unrelated states.
- Redrew the Bored expression and adjusted Sprout, Cat, and Robot bodies for upright breathing motion.
- Refined the Ghost hem with masking to remove visible seams.
- Updated README usage to document npm imports while retaining CDN, local, and framework integrations.

### Fixed

- Fixed source CommonJS loading so emotion definitions are available instead of an empty registry.
- Fixed the npm entry to register bundled characters when loaded from Node/CommonJS.

### Packaging

- Moved the build-only `esbuild` dependency to `devDependencies`.
- Added generated `dist/lively-mascot.cjs`, `dist/lively-mascot.mjs`, and `types/index.d.ts` to the published package.
