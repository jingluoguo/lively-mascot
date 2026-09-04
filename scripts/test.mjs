import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const mascot = require('../dist/lively-mascot.cjs');
const emotionSource = await readFile(new URL('../src/core/emotions.js', import.meta.url), 'utf8');
const characterDirectory = new URL('../src/characters/', import.meta.url);
const characterFiles = await readdir(characterDirectory);
const modelJsIds = characterFiles.filter((file) => file.endsWith('.model.js'))
  .map((file) => file.slice(0, -'.model.js'.length)).sort();
const modelCssIds = characterFiles.filter((file) => file.endsWith('.model.css'))
  .map((file) => file.slice(0, -'.model.css'.length)).sort();
if (!modelJsIds.length || modelJsIds.join(',') !== modelCssIds.join(',')) {
  throw new Error(`Model entry files are not paired: JS=${modelJsIds.join(',')} CSS=${modelCssIds.join(',')}`);
}
const cssSources = await Promise.all([
  readFile(new URL('../src/lively-mascot.css', import.meta.url), 'utf8'),
  ...modelCssIds.map((id) => readFile(new URL('../src/characters/' + id + '.model.css', import.meta.url), 'utf8')),
]);
if (!cssSources[0].includes('.lively-mascot.is-happy [data-mascot-part="eyes"] .lively-face__pupil')) {
  throw new Error('Happy state must hide the default pupil after eye action rules');
}
const modelCssSource = cssSources.slice(1).join('\n');
if (/\.is-emotion-[a-z0-9-]+/i.test(modelCssSource)) {
  throw new Error('Model CSS must use semantic data-mascot-behaviors selectors instead of emotion IDs');
}
const browserBundle = await readFile(new URL('../dist/lively-mascot.min.js', import.meta.url), 'utf8');
const esmBundle = await readFile(new URL('../dist/lively-mascot.mjs', import.meta.url), 'utf8');

if (/from[\s\S]*lively-mascot\.cjs/.test(esmBundle)) {
  throw new Error('ESM bundle must not wrap the CommonJS bundle');
}

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const active = force === undefined ? !this.values.has(value) : force;
    if (active) this.values.add(value); else this.values.delete(value);
    return active;
  }
  toString() { return [...this.values].join(' '); }
}

class FakeStyle {
  constructor() { this.values = {}; }
  setProperty(name, value) { this.values[name] = String(value); }
  removeProperty(name) { delete this.values[name]; }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.style = new FakeStyle();
    this.classList = new FakeClassList();
    this.attributes = {};
    this.parentNode = null;
    this.listeners = {};
  }
  get className() { return this.classList.toString(); }
  set className(value) { this.classList = new FakeClassList(); this.classList.add(...String(value).split(/\s+/).filter(Boolean)); }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  insertBefore(child, reference) {
    child.parentNode = this;
    const index = this.children.indexOf(reference);
    if (index === -1) this.children.push(child); else this.children.splice(index, 0, child);
    return child;
  }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((child) => child !== this); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  removeAttribute(name) { delete this.attributes[name]; }
  toggleAttribute(name, force) { if (force) this.setAttribute(name, ''); else this.removeAttribute(name); }
  addEventListener(name, handler) { (this.listeners[name] || (this.listeners[name] = [])).push(handler); }
  removeEventListener(name, handler) { this.listeners[name] = (this.listeners[name] || []).filter((item) => item !== handler); }
  dispatch(name, event = {}) { (this.listeners[name] || []).slice().forEach((handler) => handler(event)); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
}

function testStringEmotionIds() {
  const original = {
    document: global.document,
    window: global.window,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
    performance: global.performance,
  };
  const document = {
    createElement: (tagName) => new FakeElement(tagName),
    createElementNS: (_namespace, tagName) => new FakeElement(tagName),
  };
  global.document = document;
  global.window = { addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
  global.requestAnimationFrame = () => 0;
  global.cancelAnimationFrame = () => {};
  global.performance = { now: () => 0 };
  try {
    const host = new FakeElement('div');
    mascot.defineModel({
      id: 'test-string-emotion',
      rig: { hop: false },
      parts: { body: { actions: ['idle'] }, eyes: { actions: ['love'] }, mouth: { actions: ['smile'] } },
      render(runtime, container) {
        const body = document.createElement('div');
        runtime.registerPart('body', body);
        runtime.registerPart('eyes', document.createElement('div'));
        runtime.registerPart('mouth', document.createElement('div'));
        container.appendChild(body);
      },
    });
    mascot.defineEmotion({ id: 'custom-ready', name: 'Custom ready', group: 'custom', behaviors: ['custom-ready'], recipe: { parts: { eyes: 'love', mouth: 'smile' } } });
    const instance = mascot.createMascot(host, { type: 'test-string-emotion', animated: false });
    instance.setEmotion('custom-ready');
    if (!instance.el.classList.contains('is-emotion-custom-ready') || instance.el.getAttribute('data-mascot-emotion') !== 'custom-ready' || instance.el.getAttribute('data-mascot-behaviors') !== 'custom-ready') {
      throw new Error('String emotion ID was not applied');
    }
    if (instance.el.getAttribute('data-mascot-action-eyes') !== 'love' || instance.el.getAttribute('data-mascot-action-mouth') !== 'smile') {
      throw new Error('Custom emotion part actions were not exposed on the root');
    }
    if (instance.getCapabilities().rig.hop !== false) throw new Error('Model rig capability was not exposed');
    instance.setEmotion('02');
    if (instance.el.classList.contains('is-emotion-custom-ready') || !instance.el.classList.contains('is-emotion-02')) {
      throw new Error('Previous string emotion class was not removed');
    }
    let rejected = false;
    try { instance.setEmotion('invalid id'); } catch (error) { rejected = /Emotion ids/.test(error.message); }
    if (!rejected) throw new Error('Invalid emotion ID was accepted');
    instance.destroy();
  } finally {
    global.document = original.document;
    global.window = original.window;
    global.requestAnimationFrame = original.requestAnimationFrame;
    global.cancelAnimationFrame = original.cancelAnimationFrame;
    global.performance = original.performance;
    delete mascot.models['test-string-emotion'];
    delete mascot.emotions['custom-ready'];
  }
}

function testRuntimeValidationAndLifecycle() {
  const original = {
    document: global.document,
    window: global.window,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
    performance: global.performance,
  };
  const document = {
    createElement: (tagName) => new FakeElement(tagName),
    createElementNS: (_namespace, tagName) => new FakeElement(tagName),
  };
  global.document = document;
  global.window = { addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
  global.requestAnimationFrame = () => 0;
  global.cancelAnimationFrame = () => {};
  global.performance = { now: () => 0 };
  try {
    const host = new FakeElement('div');
    for (const badSize of [NaN, -1, Infinity, '120']) {
      let rejected = false;
      try { mascot.createMascot(host, { animated: false, size: badSize }); } catch (error) { rejected = /size must/.test(error.message); }
      if (!rejected) throw new Error('Invalid size was accepted: ' + String(badSize));
    }
    for (const badInterval of [[4, 2], [-1, 2], [0, Infinity], ['0', 2], [1]]) {
      let rejected = false;
      try { mascot.createMascot(host, { animated: false, hopInterval: badInterval }); } catch (error) { rejected = /hopInterval/.test(error.message); }
      if (!rejected) throw new Error('Invalid hopInterval was accepted: ' + JSON.stringify(badInterval));
    }
    const passive = mascot.createMascot(host, { animated: false, size: 120 });
    if (passive.el.style.values.width !== '120px' || passive.el.style.values.height !== '120px' || passive.el.getAttribute('aria-hidden') !== 'true') {
      throw new Error('Mascot dimensions or passive accessibility state are invalid');
    }
    const cat = mascot.createMascot(host, { type: 'cat', animated: false });
    if (cat.el.style.values['--lively-body'] !== '#3d4852' || cat.el.style.values['--lively-outline'] !== '#131a20') {
      throw new Error('Model presentation theme was not applied by default');
    }
    cat.destroy();
    passive.setTheme({ body: '#123456' });
    if (passive.el.style.values['--lively-body'] !== '#123456') throw new Error('Theme color was not applied');
    passive.setTheme({ body: null, outline: '' });
    if (passive.el.style.values['--lively-body'] !== '#48ff42' || passive.el.style.values['--lively-outline'] !== '#080808') throw new Error('Theme clearing did not restore model defaults');
    passive.destroy();
    passive.destroy();

    let staticClickCount = 0;
    const staticInteractive = mascot.createMascot(host, { animated: false, onClick: () => { staticClickCount++; } });
    staticInteractive.el.dispatch('keydown', { key: 'Enter', preventDefault() {} });
    if (staticClickCount !== 1) throw new Error('Static interactive mascot did not support keyboard activation');
    staticInteractive.destroy();

    let clickCount = 0;
    const interactive = mascot.createMascot(host, { onClick: () => { clickCount++; }, ariaLabel: 'Test mascot' });
    if (interactive.el.getAttribute('role') !== 'button' || interactive.el.getAttribute('tabindex') !== '0' || interactive.el.getAttribute('aria-label') !== 'Test mascot' || interactive.el.getAttribute('aria-hidden')) {
      throw new Error('Interactive mascot accessibility state is invalid');
    }
    interactive.el.dispatch('pointerdown');
    interactive.el.dispatch('keydown', { key: ' ', preventDefault() {} });
    if (clickCount !== 2) throw new Error('Pointer and keyboard activation did not invoke onClick');
    interactive.destroy();
    interactive.el.dispatch('pointerdown');
    if (clickCount !== 2) throw new Error('destroy did not remove pointer interaction');
  } finally {
    global.document = original.document;
    global.window = original.window;
    global.requestAnimationFrame = original.requestAnimationFrame;
    global.cancelAnimationFrame = original.cancelAnimationFrame;
    global.performance = original.performance;
  }
}

const emotionIds = Object.keys(mascot.emotions);
if (!emotionIds.length) throw new Error('No emotions were registered');
emotionIds.forEach((id) => {
  const emotion = mascot.emotions[id];
  if (!emotion || emotion.id !== id || !emotion.name || !Array.isArray(emotion.behaviors)) {
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

testStringEmotionIds();
testRuntimeValidationAndLifecycle();

const esmMascot = await import(new URL('../dist/lively-mascot.mjs', import.meta.url));
if (typeof esmMascot.createMascot !== 'function' || Object.keys(esmMascot.models).sort().join(',') !== modelIds.join(',')) {
  throw new Error('ESM bundle does not expose the complete SDK');
}

console.log('Smoke tests passed');
