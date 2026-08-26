// Build a single-file distributable bundle (JS + CSS) for one-line CDN use.
// Run: node scripts/build-dist.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const jsFiles = [
  'src/core/emotions.js',
  'src/core/rig.js',
  'src/lively-mascot.js',
  'src/characters/sprout.js',
  'src/characters/cat.js',
  'src/characters/robot.js',
  'src/characters/ghost.js',
  'src/characters/jelly.js',
];

const cssFiles = [
  'src/lively-mascot.css',
  'src/characters/sprout.css',
  'src/characters/cat.css',
  'src/characters/robot.css',
  'src/characters/ghost.css',
  'src/characters/jelly.css',
];

// The SDK ships as a UMD wrapper. For a browser-only bundle we strip the
// CommonJS branch (require/module.exports) so esbuild won't inject a CJS shim,
// and keep the global `var` declarations so cross-file globals still resolve.
const UMD_HEAD_RE = /\(function \(root, factory\) \{[\s\S]*?function \(LivelyEmotionGroups, LivelyEmotions\) \{/;
const UMD_HEAD_NEW = `(function (LivelyEmotionGroups, LivelyEmotions) {
  var root = typeof self !== "undefined" ? self : this;
  root.LivelyMascot = (function (LivelyEmotionGroups, LivelyEmotions) {`;
const UMD_TAIL_NEW = `})(LivelyEmotionGroups, LivelyEmotions);
})((typeof self !== "undefined" ? self : this).LivelyEmotionGroups || {}, (typeof self !== "undefined" ? self : this).LivelyEmotions || {});`;

async function main() {
  let js = '';
  for (const f of jsFiles) {
    let src = await readFile(join(root, f), 'utf8');
    if (f === 'src/lively-mascot.js') {
      if (!UMD_HEAD_RE.test(src)) throw new Error('UMD head changed — update build script');
      src = src.replace(UMD_HEAD_RE, UMD_HEAD_NEW).replace(/\n\}\);\s*$/, '\n' + UMD_TAIL_NEW);
    }
    js += src.trim() + '\n;\n';
  }
  // The IIFE wrapper would otherwise hide top-level `var LivelyEmotions` from
  // window, breaking `root.LivelyEmotions`. Promote the declaration to a real
  // global so it stays reachable after esbuild bundles everything together.
  js = js.replace(/var LivelyEmotions =/, 'window.LivelyEmotions =');

  const jsResult = await esbuild.transform(js, {
    loader: 'js',
    minify: true,
    format: 'iife',
  });
  const jsOut = jsResult.code;

  let css = '';
  for (const f of cssFiles) css += (await readFile(join(root, f), 'utf8')).trim() + '\n';

  const outDir = join(root, 'dist');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'lively-mascot.min.js'), jsOut);
  await writeFile(join(outDir, 'lively-mascot.min.css'), css);
  // Keep npm's module entry points thin: the source SDK is the canonical
  // runtime, while the browser bundle remains the zero-build distribution.
  await writeFile(join(outDir, 'lively-mascot.cjs'), 'module.exports = require("../src/lively-mascot.js");\n');
  await writeFile(join(outDir, 'lively-mascot.mjs'), [
    'import mascot from "./lively-mascot.cjs";',
    'export const createMascot = mascot.createMascot;',
    'export const registerCharacter = mascot.registerCharacter;',
    'export const defineMascotElement = mascot.defineMascotElement;',
    'export const buildFaceSvg = mascot.buildFaceSvg;',
    'export const characters = mascot.characters;',
    'export const emotions = mascot.emotions;',
    'export const emotionGroups = mascot.emotionGroups;',
    'export const version = mascot.version;',
    'export default mascot;',
    ''
  ].join('\n'));
  console.log('Built dist/lively-mascot.min.js (' + jsOut.length + ' bytes)');
  console.log('Built dist/lively-mascot.min.css (' + css.length + ' bytes)');
}

main().catch((e) => { console.error(e); process.exit(1); });
