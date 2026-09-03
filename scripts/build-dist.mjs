// Build a single-file distributable bundle (JS + CSS) for one-line CDN use.
// Run: node scripts/build-dist.mjs
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function discoverModelFiles() {
  const directory = join(root, 'src/characters');
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const scripts = files.filter((name) => name.endsWith('.model.js')).sort();
  const styles = files.filter((name) => name.endsWith('.model.css')).sort();
  const scriptIds = new Set(scripts.map((name) => name.slice(0, -'.model.js'.length)));
  const styleIds = new Set(styles.map((name) => name.slice(0, -'.model.css'.length)));
  const missingStyles = [...scriptIds].filter((id) => !styleIds.has(id));
  const missingScripts = [...styleIds].filter((id) => !scriptIds.has(id));
  if (missingStyles.length || missingScripts.length) {
    throw new Error('Each model needs matching .model.js and .model.css files' +
      (missingStyles.length ? '; missing CSS: ' + missingStyles.join(', ') : '') +
      (missingScripts.length ? '; missing JS: ' + missingScripts.join(', ') : ''));
  }
  if (!scripts.length) throw new Error('No model entry files found in src/characters');
  return {
    scripts: scripts.map((name) => join('src/characters', name)),
    styles: styles.map((name) => join('src/characters', name)),
  };
}

function createBundleEntry(characterFiles) {
  const requires = characterFiles.map((file) => `require(${JSON.stringify('./' + file)});`);
  return [
    'const mascot = require("./src/lively-mascot.js");',
    ...requires,
    'module.exports = mascot;',
  ].join('\n');
}

function getAnimationName(value) {
  return String(value).trim().split(/\s+/, 1)[0];
}

function validateEmotionAnimations(emotionSource, css) {
  const references = [...emotionSource.matchAll(/(?:bodyAnim|leafAnim|footAnim):\s*"([^"]+)"/g)]
    .map((match) => getAnimationName(match[1]));
  const keyframes = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]));
  const missing = [...new Set(references)].filter((name) => !keyframes.has(name));
  if (missing.length) {
    throw new Error('Emotion animations missing keyframes: ' + missing.join(', '));
  }
}

async function main() {
  const modelFiles = await discoverModelFiles();
  const cssFiles = ['src/lively-mascot.css', ...modelFiles.styles];
  const emotionSource = await readFile(join(root, 'src/core/emotions.js'), 'utf8');
  let css = '';
  for (const f of cssFiles) css += (await readFile(join(root, f), 'utf8')).trim() + '\n';
  validateEmotionAnimations(emotionSource, css);

  const entry = createBundleEntry(modelFiles.scripts);
  const sharedBuildOptions = {
    stdin: { contents: entry, resolveDir: root, sourcefile: 'lively-mascot-entry.js' },
    bundle: true,
    minify: true,
    write: false,
  };
  const [jsResult, cjsResult] = await Promise.all([
    esbuild.build({ ...sharedBuildOptions, format: 'iife', globalName: 'LivelyMascot', platform: 'browser' }),
    esbuild.build({ ...sharedBuildOptions, format: 'cjs', platform: 'node' }),
  ]);
  const jsOut = jsResult.outputFiles[0].text;
  const cjsOut = cjsResult.outputFiles[0].text;
  const cssOut = (await esbuild.transform(css, { loader: 'css', minify: true })).code;

  const outDir = join(root, 'dist');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'lively-mascot.min.js'), jsOut);
  await writeFile(join(outDir, 'lively-mascot.min.css'), cssOut);
  await writeFile(join(outDir, 'lively-mascot.cjs'), cjsOut);
  await writeFile(join(outDir, 'lively-mascot.mjs'), [
    'import mascot from "./lively-mascot.cjs";',
    'export const createMascot = mascot.createMascot;',
    'export const defineModel = mascot.defineModel;',
    'export const defineMascotElement = mascot.defineMascotElement;',
    'export const buildFaceSvg = mascot.buildFaceSvg;',
    'export const models = mascot.models;',
    'export const partActions = mascot.partActions;',
    'export const emotions = mascot.emotions;',
    'export const emotionGroups = mascot.emotionGroups;',
    'export const version = mascot.version;',
    'export default mascot;',
    ''
  ].join('\n'));
  console.log('Built dist/lively-mascot.min.js (' + jsOut.length + ' bytes)');
  console.log('Built dist/lively-mascot.min.css (' + cssOut.length + ' bytes)');
  console.log('Built dist/lively-mascot.cjs (' + cjsOut.length + ' bytes)');
}

main().catch((e) => { console.error(e); process.exit(1); });
