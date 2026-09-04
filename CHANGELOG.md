# Changelog

[简体中文](CHANGELOG.zh-CN.md)

All notable changes to this project are documented here.

## [0.3.0] - 2026-09-04

### Added

- Added a declarative `defineModel()` contract for custom models, including parts, actions, skin slots, accessories, effects, presentation metadata, and rig capabilities.
- Added semantic emotion behavior tags and string emotion IDs, allowing model styles to react without depending on numeric IDs.
- Added model-specific action recipes with accessory toggles and anchored effects such as hearts, sparkles, sleep, and loading indicators.
- Added scoped gaze registration for eye-only or whole-model tracking, plus configurable blink, gaze, hop, and spin capabilities.
- Added modular model discovery and paired per-character CSS distribution files for smaller package imports.
- Added an interactive action composer and expanded the image-to-model skill contract documentation.

### Changed

- Reworked built-in character registration around the unified model runtime and shared SVG face builder.
- Improved gaze and 3D posture behavior with per-eye scaling, depth, rotation, vertical response, and model-aware gaze wrappers.
- Updated the demo with native color pickers, model default color cards, face variants, custom action composition, and bilingual model presentation metadata.
- Applied each model's presentation theme by default, while preserving per-instance theme overrides.
- Paused runtime gaze, blinking, hopping, and timers while the document is hidden or `prefers-reduced-motion` is enabled, with automatic resume.
- Improved package exports with ESM/CJS-specific TypeScript declarations, Node.js engine metadata, and more precise side-effect declarations.

### Fixed

- Fixed happy click eyes so the default pupils do not remain visible over the smiling-eye expression.
- Fixed model theme reset behavior so clearing a custom color restores the active model's defaults.

### Packaging

- Added `types/index.d.mts` and `types/index.d.cts` for reliable TypeScript resolution across ESM and CommonJS consumers.
- Regenerated browser, ESM, CommonJS, core CSS, and per-character CSS distribution files.

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
