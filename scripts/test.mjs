import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const mascot = require('../dist/lively-mascot.cjs');
const emotionSource = await readFile(new URL('../src/core/emotions.js', import.meta.url), 'utf8');
const characterDirectory = new URL('../src/characters/', import.meta.url);
const characterCssFiles = (await readdir(characterDirectory))
  .filter((file) => file.endsWith('.css'))
  .sort();
const cssSources = await Promise.all([
  readFile(new URL('../src/lively-mascot.css', import.meta.url), 'utf8'),
  ...characterCssFiles.map((file) => readFile(new URL('../src/characters/' + file, import.meta.url), 'utf8')),
]);
const browserBundle = await readFile(new URL('../dist/lively-mascot.min.js', import.meta.url), 'utf8');

const emotionIds = Object.keys(mascot.emotions);
if (!emotionIds.length) throw new Error('No emotions were registered');
emotionIds.forEach((id) => {
  const emotion = mascot.emotions[id];
  if (!emotion || emotion.id !== id || !emotion.name) {
    throw new Error(`Invalid emotion definition: ${id}`);
  }
});

const modelIds = Object.keys(mascot.models).sort();
if (!modelIds.length) throw new Error('No models were registered');

const animationNames = [...emotionSource.matchAll(/(?:bodyAnim|leafAnim|footAnim):\s*"([^"]+)"/g)]
  .map((match) => match[1].trim().split(/\s+/, 1)[0]);
const keyframes = new Set([...cssSources.join('\n').matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]));
const missingAnimations = [...new Set(animationNames)].filter((name) => !keyframes.has(name));
if (missingAnimations.length) throw new Error(`Missing emotion keyframes: ${missingAnimations.join(', ')}`);

const browserContext = {
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  performance: { now: () => 0 }
};
browserContext.window = browserContext;
browserContext.self = browserContext;
browserContext.globalThis = browserContext;
vm.runInNewContext(browserBundle, browserContext, { filename: 'lively-mascot.min.js' });

if (!browserContext.LivelyMascot) throw new Error('Browser bundle did not expose LivelyMascot');
const browserModelIds = Object.keys(browserContext.LivelyMascot.models).sort();
if (browserModelIds.join(',') !== modelIds.join(',')) {
  throw new Error(`Browser bundle model IDs differ: ${browserModelIds.join(',')}`);
}

console.log('Smoke tests passed');
