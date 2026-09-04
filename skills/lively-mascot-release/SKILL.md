---
name: lively-mascot-release
description: Compare a previous Lively Mascot version with a target release, update version metadata and bilingual changelogs, rebuild distribution files, and verify the package.
---

# Lively Mascot Release

Use this skill when the user asks to prepare, document, or upgrade a Lively Mascot release version (for example, from `0.2.0` to `0.3.0`). The result is a versioned project tree with release notes based on the actual file/behavior difference between versions.

## Core rule

Describe the difference between the previous version tag and the target version's code tree. Do not turn commit subjects, commit count, internal refactors, or development activity into release highlights. Existing capabilities must not be listed as new unless the comparison shows that they changed.

Use objective release-note language in Chinese; do not use first-person wording such as “我”. Prefer phrases such as “新增”“支持”“改进”“修复” and state the user-visible outcome.

## Workflow

1. Inspect the repository before editing:
   - `git status --short`
   - `git tag --sort=-creatordate`
   - `git diff --stat <previous-tag>..HEAD`
   - inspect `git diff <previous-tag>..HEAD` for public API, runtime, demo, packaging, and documentation changes.
2. Resolve the comparison base. Prefer the matching tag (for example, `v0.2.0`). If it does not exist, identify the previous released version from `package.json`/changelog and state that limitation instead of inventing a tag.
3. Compare behavior and public surfaces directly:
   - `src/lively-mascot.js`, `src/core/rig.js`, `src/core/emotions.js`, and `src/lively-mascot.css`
   - built-in model files under `src/characters/`
   - `types/index.d.ts`, `package.json`, `scripts/build-dist.mjs`, `scripts/test.mjs`
   - `index.html`, `docs/`, and README files.
4. Update the target version in all relevant project metadata:
   - `package.json` `version`
   - the SDK version comment and returned `version` in `src/lively-mascot.js`
   - generated bundles via `npm run build`
   - README CDN/tag examples when they point to the released version.
5. Add a new top section to both `CHANGELOG.md` and `CHANGELOG.zh-CN.md` using the target version and release date. Keep the existing historical sections unchanged.
   - Organize only non-empty sections, usually `Added`/`新增`, `Changed`/`变更`, `Fixed`/`修复`, and `Packaging and Documentation`/`发布与文档`.
   - Mention only changes supported by the version-to-version diff.
   - Explicitly avoid claiming unchanged features (such as existing characters, emotion counts, or view modes) as additions.
6. Validate after edits:
   - `npm test`
   - `git diff --check`
   - optionally `npm exec --yes publint -- --strict .` for package metadata.
   - search for stale version references with `rg` and ensure generated `dist` files match the target version.

## Release-note style

Use a concise GitHub Release title such as:

```markdown
[**v0.3.0 – Model Runtime & Theming Upgrade**](https://github.com/jingluoguo/lively-mascot/releases/tag/v0.3.0)
```

The title must use the actual target version and repository URL. Do not claim that a GitHub Release was published; this skill only prepares project files and release text unless the user separately asks for publishing.

## Safety and scope

- Do not run `git add`, `git commit`, tag creation, or publishing commands unless the user explicitly asks for that action.
- Preserve unrelated user changes and do not reset or overwrite them.
- Treat generated `dist` changes as expected after a successful build; report validation results and any remaining warnings.
