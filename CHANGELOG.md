# Changelog

[简体中文](CHANGELOG.zh-CN.md)

All notable changes to this project are documented here.

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
