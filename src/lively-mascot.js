/**
 * lively-mascot · core SDK (v0.3.1)
 *
 * Requires: src/core/emotions.js, src/core/dom.js, src/core/rig.js
 * (loaded before this script)
 * Character files (src/characters/*.js) register themselves after this script.
 *
 * @license MIT
 */
(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var emo = require("./core/emotions.js");
    var dom = require("./core/dom.js");
    var api = factory(emo.groups, emo.emotions, dom);
    // Character modules are optional in direct source usage. Distribution
    // bundles discover and register every built-in character at build time.
    if (typeof globalThis !== "undefined") globalThis.LivelyMascot = api;
    require("./core/rig.js");
    module.exports = api;
  } else {
    root.LivelyMascot = factory(
      root.LivelyEmotionGroups || {},
      root.LivelyEmotions || {},
      root.LivelyDom || {}
    );
  }
})(typeof self !== "undefined" ? self : this, function (LivelyEmotionGroups, LivelyEmotions, LivelyDom) {
  "use strict";

  // --- DOM Helpers ---
  var el = LivelyDom.hEl;
  var hEl = LivelyDom.hEl;
  var svg = LivelyDom.svg;

  /**
   * Shared face builder. Every character reuses the same eye/pupil/mouth
   * library so emotion CSS works uniformly across sprout, cat, robot, etc.
   *
   * @param {object} api  the rig.api object (registers eyes / pupils / face)
   * @returns {{ wrap: HTMLElement, face: SVGElement }} wrap = .lively-face-wrap
   */
  function buildFaceSvg(api) {
    var runtime = api && api.rig ? api : null;
    var rigApi = runtime ? runtime.rig : api;
    function registerPart(name, element, options) {
      if (runtime) runtime.registerPart(name, element, options);
      else if (name === "eyes") rigApi.registerEye(element, options && options.gaze);
      else if (name === "pupils") rigApi.registerPupil(element, options && options.gaze);
      else if (name === "face") rigApi.registerFace(element);
    }
    var clipId = "lively-eye-clip-" + Math.random().toString(36).slice(2, 9);

    function buildEye(cx, cy, side) {
      var wrapper = svg("g", { transform: "translate(" + cx + " " + cy + ")" });
      var eye = svg("g", { class: "lively-face__eye lively-face__eye--" + side });
      registerPart("eyes", eye, {
        gaze: {
          maxX: 3.6,
          maxY: 2.4,
          scale: 0.035,
          depth: 0.1,
          verticalScale: 0.075,
          side: side === "l" ? "left" : "right",
          sideScale: 0.075
        }
      });
      eye.appendChild(svg("ellipse", { rx: 10, ry: 11.5 }));
      // Half-lidded bored eye: a flat upper lid with a softly curved lower edge.
      eye.appendChild(svg("path", { class: "lively-face__bored-eye", d: "M-9 -3 L9 -3 C8 4.5 4 8 0 8 C-4 8 -8 4.5 -9 -3 Z" }));
      // Minimal variants use distinct primitives so they stay recognizable at thumbnail size.
      eye.appendChild(svg("rect", { class: "lively-face__capsule", x: -4.5, y: -12, width: 9, height: 24, rx: 4.5, ry: 4.5 }));
      eye.appendChild(svg("circle", { class: "lively-face__dot-eye", cx: 0, cy: 0, r: 5.5 }));
      var clip = svg("g", { "clip-path": "url(#" + clipId + ")" });
      var pupil = svg("g");
      registerPart("pupils", pupil, { gaze: { maxX: 8, maxY: 6 } });
      pupil.appendChild(svg("circle", { class: "lively-face__pupil", r: 6.2 }));
      pupil.appendChild(svg("circle", { class: "lively-face__shine", cx: 2.2, cy: -2.4, r: 2.1 }));
      pupil.appendChild(svg("circle", { class: "lively-face__shine lively-face__shine--small", cx: -2.2, cy: 2.1, r: 1 }));
      clip.appendChild(pupil);
      eye.appendChild(clip);
      eye.appendChild(svg("path", { class: "lively-face__happy", d: "M-8 2.5 Q0 -8.5 8 2.5" }));
      wrapper.appendChild(eye);
      return wrapper;
    }

    var face = svg("g", { class: "lively-face" });
    registerPart("face", face);
    if (runtime) runtime.registerPart("mouth", face);

    // Blush
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 20, cy: 57, rx: 7, ry: 4 }));
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 80, cy: 57, rx: 7, ry: 4 }));

    // Eyes
    face.appendChild(buildEye(34, 43, "l"));
    face.appendChild(buildEye(66, 43, "r"));

    // Default mouth
    face.appendChild(svg("path", { class: "lively-face__mouth", d: "M42 63 Q50 70 58 63" }));
    // Happy mouth
    face.appendChild(svg("path", { class: "lively-face__happy-mouth", d: "M40 61 Q50 74 60 61 Q50 66 40 61 Z" }));
    // Frown mouth, shared by low-battery, aggrieved, and related expressions.
    face.appendChild(svg("path", { class: "lively-face__sad-mouth", d: "M43 67 Q50 62 57 67" }));
    // Open mouth
    face.appendChild(svg("ellipse", { class: "lively-face__open-mouth", cx: 50, cy: 65, rx: 5, ry: 6 }));
    // Flat mouth
    face.appendChild(svg("line", { class: "lively-face__flat-mouth", x1: 43, y1: 65, x2: 57, y2: 65 }));
    // Bored mouth: almost level, with a restrained lift at one corner.
    face.appendChild(svg("path", { class: "lively-face__bored-mouth", d: "M42.5 65.2 C47.5 65.9 53 65.7 57.5 64.2" }));
    // Sleep eyes
    face.appendChild(svg("line", { class: "lively-face__sleep-eye lively-face__sleep-eye--l", x1: 27, y1: 43, x2: 41, y2: 43 }));
    face.appendChild(svg("line", { class: "lively-face__sleep-eye lively-face__sleep-eye--r", x1: 59, y1: 43, x2: 73, y2: 43 }));
    // Angry brows
    face.appendChild(svg("line", { class: "lively-face__angry-brow lively-face__angry-brow--l", x1: 25, y1: 32, x2: 38, y2: 35 }));
    face.appendChild(svg("line", { class: "lively-face__angry-brow lively-face__angry-brow--r", x1: 75, y1: 32, x2: 62, y2: 35 }));
    // X eyes
    face.appendChild(svg("g", { class: "lively-face__x-eye lively-face__x-eye--l", transform: "translate(34,43)" }, [
      svg("line", { x1: -6, y1: -7, x2: 6, y2: 7 }),
      svg("line", { x1: 6, y1: -7, x2: -6, y2: 7 })
    ]));
    face.appendChild(svg("g", { class: "lively-face__x-eye lively-face__x-eye--r", transform: "translate(66,43)" }, [
      svg("line", { x1: -6, y1: -7, x2: 6, y2: 7 }),
      svg("line", { x1: 6, y1: -7, x2: -6, y2: 7 })
    ]));
    // Heart eyes
    face.appendChild(svg("path", { class: "lively-face__heart-eye lively-face__heart-eye--l", transform: "translate(34,42)", d: "M0 3 C0 0, -5 -4, -7 -1 C-9 2, 0 9, 0 9 C0 9, 9 2, 7 -1 C5 -4, 0 0, 0 3Z" }));
    face.appendChild(svg("path", { class: "lively-face__heart-eye lively-face__heart-eye--r", transform: "translate(66,42)", d: "M0 3 C0 0, -5 -4, -7 -1 C-9 2, 0 9, 0 9 C0 9, 9 2, 7 -1 C5 -4, 0 0, 0 3Z" }));
    // Cry eyes
    face.appendChild(svg("path", { class: "lively-face__cry-eye lively-face__cry-eye--l", transform: "translate(34,43)", d: "M-6 2 Q0 -4 6 2" }));
    face.appendChild(svg("path", { class: "lively-face__cry-eye lively-face__cry-eye--r", transform: "translate(66,43)", d: "M-6 2 Q0 -4 6 2" }));
    // Tears
    face.appendChild(svg("g", { class: "lively-face__tear lively-face__tear--l", transform: "translate(40,52)" }, [
      svg("ellipse", { cx: 0, cy: 0, rx: 2.5, ry: 3.5, fill: "#6ec7ff", opacity: "0.8" }),
      svg("ellipse", { cx: 0, cy: 8, rx: 1.8, ry: 2.5, fill: "#6ec7ff", opacity: "0.5" })
    ]));
    face.appendChild(svg("g", { class: "lively-face__tear lively-face__tear--r", transform: "translate(60,52)" }, [
      svg("ellipse", { cx: 0, cy: 0, rx: 2.5, ry: 3.5, fill: "#6ec7ff", opacity: "0.8" }),
      svg("ellipse", { cx: 0, cy: 8, rx: 1.8, ry: 2.5, fill: "#6ec7ff", opacity: "0.5" })
    ]));
    // Sweat drop
    face.appendChild(svg("g", { class: "lively-face__sweat", transform: "translate(82,30)" }, [
      svg("path", { d: "M0 0 C-3 5, -3 10, 0 12 C3 10, 3 5, 0 0Z", fill: "#6ec7ff", opacity: "0.7" })
    ]));
    // Star eyes
    face.appendChild(svg("g", { class: "lively-face__star-eye lively-face__star-eye--l", transform: "translate(34,43)" }, [
      svg("polygon", { points: "0,-8 2,-3 7,-3 3,1 5,7 0,3 -5,7 -3,1 -7,-3 -2,-3", fill: "#ffe066" })
    ]));
    face.appendChild(svg("g", { class: "lively-face__star-eye lively-face__star-eye--r", transform: "translate(66,43)" }, [
      svg("polygon", { points: "0,-8 2,-3 7,-3 3,1 5,7 0,3 -5,7 -3,1 -7,-3 -2,-3", fill: "#ffe066" })
    ]));
    // Sparkles
    face.appendChild(svg("g", { class: "lively-face__sparkle lively-face__sparkle--1", transform: "translate(15,20)" }, [
      svg("line", { x1: 0, y1: -4, x2: 0, y2: 4, stroke: "#ffe066", "stroke-width": "1.5" }),
      svg("line", { x1: -4, y1: 0, x2: 4, y2: 0, stroke: "#ffe066", "stroke-width": "1.5" })
    ]));
    face.appendChild(svg("g", { class: "lively-face__sparkle lively-face__sparkle--2", transform: "translate(85,18)" }, [
      svg("line", { x1: 0, y1: -3, x2: 0, y2: 3, stroke: "#ffe066", "stroke-width": "1.2" }),
      svg("line", { x1: -3, y1: 0, x2: 3, y2: 0, stroke: "#ffe066", "stroke-width": "1.2" })
    ]));
    // Waiting dots
    face.appendChild(svg("g", { class: "lively-face__waiting-dots", transform: "translate(42,68)" }, [
      svg("circle", { cx: 0, cy: 0, r: 2, fill: "#888" }),
      svg("circle", { cx: 8, cy: 0, r: 2, fill: "#888" }),
      svg("circle", { cx: 16, cy: 0, r: 2, fill: "#888" })
    ]));

    var faceSvg = svg("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" });
    var defs = svg("defs");
    var clipPath = svg("clipPath", { id: clipId });
    clipPath.appendChild(svg("ellipse", { rx: 10, ry: 11.5 }));
    defs.appendChild(clipPath);
    faceSvg.appendChild(defs);
    faceSvg.appendChild(face);
    var wrap = hEl("div", { class: "lively-face-wrap" });
    wrap.appendChild(faceSvg);

    return { wrap: wrap, face: face };
  }

  // --- Unified Model Registry ---
  // A model declares its render function, its real parts, skin slots, and
  // available effect anchors in one place. There is intentionally no markup
  // importer: imported artwork must become an explicit model definition.
  var models = {};
  var STANDARD_ACTIONS = {
    body: ["idle", "breathe", "wake", "rest", "bounce", "shake", "pulse", "work", "dim", "refresh"],
    eyes: ["open", "closed", "happy", "wide", "sad", "angry", "love", "thinking", "bored", "cry"],
    mouth: ["neutral", "smile", "open", "flat", "frown", "talk"],
    top: ["idle", "perk", "droop", "shake", "listen", "work"],
    feet: ["rest", "step", "stomp", "happy"],
    tail: ["idle", "happy", "droop", "puff", "tuck"],
    accessory: ["idle", "happy", "alert"]
  };
  var DEFAULT_RIG_CAPABILITIES = {
    blink: true,
    gaze: true,
    hop: true,
    spin: true
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function normalizePartDefinition(def) {
    if (def === true) return { actions: [] };
    def = def || {};
    return { actions: (def.actions || []).slice() };
  }

  function normalizeFixedSkin(fixed) {
    var result = {};
    if (Array.isArray(fixed)) {
      for (var i = 0; i < fixed.length; i++) {
        var legacyName = String(fixed[i]);
        if (!/^[a-z][a-z0-9-]*$/.test(legacyName)) {
          throw new Error("skin.fixed names must use lowercase kebab-case");
        }
        result[legacyName] = "";
      }
      return result;
    }
    fixed = fixed || {};
    for (var key in fixed) {
      if (Object.prototype.hasOwnProperty.call(fixed, key)) {
        var name = String(key);
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Error("skin.fixed names must use lowercase kebab-case");
        }
        result[name] = String(fixed[key]);
      }
    }
    return result;
  }

  function normalizeAccessories(accessories) {
    var result = {};
    accessories = accessories || {};
    for (var key in accessories) {
      if (Object.prototype.hasOwnProperty.call(accessories, key)) {
        var id = String(key);
        if (!/^[a-z][a-z0-9-]*$/.test(id)) {
          throw new Error("accessory names must use lowercase kebab-case");
        }
        var definition = accessories[key] === true ? {} : (accessories[key] || {});
        result[id] = {
          default: definition.default === true,
          actions: (definition.actions || STANDARD_ACTIONS.accessory).slice()
        };
      }
    }
    return result;
  }

  function normalizePresentation(presentation, name) {
    presentation = presentation || {};
    var labels = presentation.labels || {};
    var theme = presentation.theme || {};
    return {
      icon: presentation.icon ? String(presentation.icon) : "",
      labels: {
        zh: labels.zh ? String(labels.zh) : String(name),
        en: labels.en ? String(labels.en) : String(name)
      },
      greeting: {
        zh: presentation.greeting && presentation.greeting.zh ? String(presentation.greeting.zh) : "",
        en: presentation.greeting && presentation.greeting.en ? String(presentation.greeting.en) : ""
      },
      order: Number.isFinite(Number(presentation.order)) ? Number(presentation.order) : 1000,
      theme: {
        body: theme.body ? String(theme.body) : "",
        outline: theme.outline ? String(theme.outline) : "",
        accent: theme.accent ? String(theme.accent) : ""
      }
    };
  }

  function normalizeRigCapabilities(rig) {
    var result = clone(DEFAULT_RIG_CAPABILITIES);
    rig = rig || {};
    for (var key in rig) {
      if (Object.prototype.hasOwnProperty.call(rig, key)) result[String(key)] = rig[key] !== false;
    }
    return result;
  }

  function defineModel(definition) {
    definition = definition || {};
    var id = String(definition.id || "").trim();
    if (!id) throw new Error("defineModel requires a non-empty id");
    if (typeof definition.render !== "function") {
      throw new Error("defineModel requires a render function");
    }
    var parts = {};
    var declaredParts = definition.parts || {};
    for (var name in declaredParts) {
      if (Object.prototype.hasOwnProperty.call(declaredParts, name)) {
        parts[name] = normalizePartDefinition(declaredParts[name]);
      }
    }
    models[id] = {
      id: id,
      name: definition.name || id,
      presentation: normalizePresentation(definition.presentation, definition.name || id),
      rig: normalizeRigCapabilities(definition.rig),
      viewBox: definition.viewBox || "0 0 100 100",
      render: definition.render,
      parts: parts,
      gaze: { scope: definition.gaze && definition.gaze.scope === "eyes" ? "eyes" : "model" },
      skin: {
        slots: (definition.skin && definition.skin.slots || ["body", "outline", "accent"]).slice(),
        fixed: normalizeFixedSkin(definition.skin && definition.skin.fixed)
      },
      accessories: normalizeAccessories(definition.accessories),
      effects: {
        supported: (definition.effects && definition.effects.supported || []).slice(),
        anchors: clone(definition.effects && definition.effects.anchors || {})
      }
    };
    return models[id];
  }

  function defineEmotion(definition) {
    definition = definition || {};
    var id = normalizeEmotionId(definition.id);
    var behaviors = definition.behaviors;
    if (!Array.isArray(behaviors) || !behaviors.length) {
      throw new Error("defineEmotion requires at least one semantic behavior tag");
    }
    var normalizedBehaviors = [];
    for (var i = 0; i < behaviors.length; i++) {
      var behavior = String(behaviors[i] == null ? "" : behaviors[i]).trim();
      if (!/^[a-z][a-z0-9-]*$/.test(behavior)) {
        throw new Error("Emotion behavior tags must use lowercase kebab-case");
      }
      if (normalizedBehaviors.indexOf(behavior) === -1) normalizedBehaviors.push(behavior);
    }
    var emotion = {};
    for (var key in definition) {
      if (Object.prototype.hasOwnProperty.call(definition, key)) emotion[key] = definition[key];
    }
    emotion.id = id;
    emotion.name = definition.name == null ? id : String(definition.name);
    emotion.group = definition.group == null ? "custom" : String(definition.group);
    emotion.desc = definition.desc == null ? "" : String(definition.desc);
    emotion.behaviors = normalizedBehaviors;
    LivelyEmotions[id] = emotion;
    return emotion;
  }

  function getModel(type) { return models[type] || models.sprout; }

  function createModelRuntime(model, rig, root) {
    var elements = {};
    var actionAttributes = {};
    var accessories = {};
    var accessoryState = {};

    function registerPart(name, element, options) {
      if (!element) return;
      name = String(name);
      if (!elements[name]) elements[name] = [];
      elements[name].push(element);
      element.setAttribute("data-mascot-part", name);
      if (name === "body") rig.registerBody(element);
      else if (name === "top") rig.registerLeaf(element, { useLeafAnim: !(options && options.useEmotionAnimation === false) });
      else if (name === "feet") rig.registerFeet(element);
      else if (name === "face") rig.registerFace(element);
      else if (name === "eyes") rig.registerEye(element, options && options.gaze);
      else if (name === "pupils") rig.registerPupil(element, options && options.gaze);
    }

    function setPartAction(name, action) {
      var part = model.parts[name];
      if (!part || !elements[name]) return;
      var attr = actionAttributes[name] || (actionAttributes[name] = "data-mascot-action-" + name);
      var rootAttr = "data-mascot-action-" + name;
      if (action && part.actions.indexOf(action) !== -1) root.setAttribute(rootAttr, action);
      else root.removeAttribute(rootAttr);
      for (var i = 0; i < elements[name].length; i++) {
        if (part.actions.indexOf(action) !== -1) elements[name][i].setAttribute(attr, action);
        else elements[name][i].removeAttribute(attr);
      }
    }

    function syncAccessory(id) {
      var active = accessoryState[id] === true;
      var items = accessories[id] || [];
      for (var i = 0; i < items.length; i++) {
        items[i].toggleAttribute("hidden", !active);
        items[i].classList.toggle("is-accessory-active", active);
      }
    }

    function registerAccessory(id, element) {
      id = String(id || "");
      if (!model.accessories[id]) throw new Error("Accessory is not declared by this model: " + id);
      if (!element) return;
      if (!accessories[id]) accessories[id] = [];
      accessories[id].push(element);
      element.setAttribute("data-mascot-part", "accessory");
      element.setAttribute("data-mascot-accessory", id);
      element.classList.add("lively-mascot__accessory");
      if (accessoryState[id] === undefined) accessoryState[id] = model.accessories[id].default;
      syncAccessory(id);
    }

    function setAccessory(id, enabled) {
      id = String(id || "");
      if (!model.accessories[id]) throw new Error("Unknown accessory: " + id);
      accessoryState[id] = enabled !== false;
      syncAccessory(id);
      return accessoryState[id];
    }

    function applyAccessoryAction(action) {
      for (var id in model.accessories) {
        if (Object.prototype.hasOwnProperty.call(model.accessories, id)) {
          var items = accessories[id] || [];
          var supportsAction = accessoryState[id] && model.accessories[id].actions.indexOf(action) !== -1;
          for (var i = 0; i < items.length; i++) {
            if (supportsAction) items[i].setAttribute("data-mascot-action-accessory", action);
            else items[i].removeAttribute("data-mascot-action-accessory");
          }
        }
      }
    }

    function applyPose(recipe) {
      recipe = recipe || {};
      var pose = recipe.parts || {};
      for (var name in model.parts) {
        if (Object.prototype.hasOwnProperty.call(model.parts, name)) {
          setPartAction(name, pose[name] || ({ eyes: "open", mouth: "neutral", feet: "rest" }[name] || "idle"));
        }
      }
      applyAccessoryAction(pose.accessory || "idle");
      renderEffects(root, model, recipe.effects || []);
    }

    return {
      rig: rig,
      registerPart: registerPart,
      registerAccessory: registerAccessory,
      setAccessory: setAccessory,
      applyPose: applyPose,
      getParts: function () { return elements; },
      getAccessories: function () {
        var result = {};
        for (var id in model.accessories) {
          if (Object.prototype.hasOwnProperty.call(model.accessories, id)) {
            result[id] = {
              enabled: accessoryState[id] === true,
              default: model.accessories[id].default,
              actions: model.accessories[id].actions.slice()
            };
          }
        }
        return result;
      }
    };
  }

  function renderEffects(root, model, requested) {
    var layer = root.querySelector(".lively-effects");
    if (!layer) return;
    layer.textContent = "";
    for (var i = 0; i < requested.length; i++) {
      var effect = requested[i];
      if (model.effects.supported.indexOf(effect.type) === -1) continue;
      var anchor = model.effects.anchors[effect.anchor] || model.effects.anchors.body || { x: 50, y: 50 };
      var count = effect.count || (effect.type === "sparkles" ? 3 : 2);
      for (var n = 0; n < count; n++) {
        var particle = hEl("span", {
          class: "lively-effects__particle lively-effects__particle--" + effect.type,
          "aria-hidden": "true"
        });
        particle.style.setProperty("--lively-effect-x", (Number(anchor.x) || 50) + "%");
        particle.style.setProperty("--lively-effect-y", (Number(anchor.y) || 50) + "%");
        particle.style.setProperty("--lively-effect-index", n);
        if (effect.type === "hearts") particle.textContent = "\u2665";
        else if (effect.type === "sleep") particle.textContent = "z";
        else if (effect.type === "sparkles") particle.textContent = "*";
        layer.appendChild(particle);
      }
    }
  }

  function normalizeViewMode(mode) {
    return String(mode || "3d").toLowerCase() === "2d" ? "2d" : "3d";
  }

  function normalizeOutlineVisible(value) {
    return value !== false && String(value).toLowerCase() !== "false";
  }

  function normalizeEmotionId(value) {
    var id = String(value == null ? "" : value).trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(id)) {
      throw new Error("Emotion ids must use letters, numbers, and single hyphens");
    }
    return id;
  }

  function normalizeSize(value) {
    if (value === undefined) return 106;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new Error("size must be a finite number greater than 0");
    }
    var size = value;
    return Math.min(size, 4096);
  }

  function normalizeHopInterval(value) {
    if (value === null) return null;
    if (value === undefined) return [6, 13];
    if (!Array.isArray(value) || value.length !== 2) throw new Error("hopInterval must be [min, max] or null");
    var min = value[0];
    var max = value[1];
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
      throw new Error("hopInterval values must be finite, non-negative, and min <= max");
    }
    return [min, max];
  }

  // --- Core API ---
  function createMascot(target, options) {
    options = options || {};
    if (!target || typeof target.appendChild !== "function") throw new Error("createMascot requires a target element");
    var type = options.type || "sprout";
    if (!models[type] && !models.sprout) throw new Error("No mascot models are registered");
    var model = getModel(type);
    if (!models[type] && typeof console !== "undefined" && console.warn) console.warn("Unknown mascot type '" + type + "'; falling back to sprout");
    var viewMode = normalizeViewMode(options.viewMode || options.mode);
    var outlineVisible = normalizeOutlineVisible(options.outlineVisible);
    var size = normalizeSize(options.size);
    var hopInterval = normalizeHopInterval(options.hopInterval);
    var interactive = typeof options.onClick === "function";
    var rootAttrs = {
      class: "lively-mascot lively-mascot--" + model.id + " lively-mascot--" + viewMode + " lively-mascot--face-default" + (!outlineVisible ? " lively-mascot--outline-hidden" : "") + (options.animated === false ? " lively-mascot--static" : "")
    };
    if (interactive) {
      rootAttrs.role = "button";
      rootAttrs.tabindex = "0";
      rootAttrs["aria-label"] = options.ariaLabel || model.presentation.labels.en || model.name || "Mascot";
    } else rootAttrs["aria-hidden"] = "true";
    var root = el("div", rootAttrs);
    root.style.setProperty("width", size + "px");
    root.style.setProperty("height", size + "px");
    var rigEl = el("div", { class: "lively-mascot__rig" });
    // gaze wrapper holds all character parts so the whole face turns with the
    // body posture (sway / lean) instead of staying dead-on.
    var gazeEl = el("div", { class: "lively-mascot__gaze" });
    rigEl.appendChild(gazeEl);
    // Start from the model contract's theme, then let instance options win.
    // This keeps each built-in model self-contained while preserving explicit
    // per-instance overrides.
    var defaultTheme = model.presentation && model.presentation.theme || {};
    var theme = {
      body: options.color || defaultTheme.body || "",
      outline: options.outline || defaultTheme.outline || "",
      accent: options.accent || defaultTheme.accent || ""
    };
    var currentEmotionClass = "";
    function setEmotionClass(id) {
      if (currentEmotionClass) root.classList.remove(currentEmotionClass);
      currentEmotionClass = "is-emotion-" + id;
      root.classList.add(currentEmotionClass);
      root.setAttribute("data-mascot-emotion", id);
      var emotion = LivelyEmotions[id];
      var behaviorTags = emotion && Array.isArray(emotion.behaviors) ? emotion.behaviors : [];
      root.setAttribute("data-mascot-behaviors", behaviorTags.join(" "));
    }
    function applyTheme() {
      var slots = ["body", "outline", "accent"];
      for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        var property = "--lively-" + slot;
        if (theme[slot]) root.style.setProperty(property, theme[slot]);
        else if (defaultTheme[slot]) root.style.setProperty(property, defaultTheme[slot]);
        else root.style.removeProperty(property);
      }
      for (var fixedName in model.skin.fixed) {
        if (Object.prototype.hasOwnProperty.call(model.skin.fixed, fixedName) && model.skin.fixed[fixedName]) {
          root.style.setProperty("--lively-fixed-" + fixedName, model.skin.fixed[fixedName]);
        }
      }
    }
    applyTheme();
    var runtime;
    var rig = createRig(root, rigEl, {
      followCursor: options.followCursor,
      gazeScope: model.gaze.scope,
      hopInterval: hopInterval,
      animated: options.animated,
      rig: model.rig
    }, {
      onClick: options.onClick,
      onEmotionChange: function (id) {
        if (runtime) runtime.applyPose((LivelyEmotions[String(id)] || {}).recipe);
      }
    });
    runtime = createModelRuntime(model, rig.api, root);
    model.render(runtime, gazeEl);
    rig.api.registerGazeWrap(gazeEl);
    root.appendChild(el("div", { class: "lively-effects", "aria-hidden": "true" }));
    root.appendChild(rigEl);
    target.appendChild(root);
    setEmotionClass("02");
    runtime.applyPose((LivelyEmotions["02"] || {}).recipe);

    var destroyed = false;
    return {
      el: root,
      type: model.id,
      getCapabilities: function () {
        return clone({ parts: model.parts, gaze: model.gaze, rig: model.rig, skin: model.skin, accessories: model.accessories, effects: model.effects, presentation: model.presentation });
      },
      getSkin: function () {
        return clone({ slots: theme, fixed: model.skin.fixed });
      },
      getAccessories: function () {
        return clone(runtime.getAccessories());
      },
      setAccessory: function (id, enabled) {
        return runtime.setAccessory(id, enabled);
      },
      get viewMode() { return viewMode; },
      setViewMode: function (mode) {
        viewMode = normalizeViewMode(mode);
        root.classList.toggle("lively-mascot--2d", viewMode === "2d");
        root.classList.toggle("lively-mascot--3d", viewMode === "3d");
        return viewMode;
      },
      get outlineVisible() { return outlineVisible; },
      setOutlineVisible: function (visible) {
        outlineVisible = normalizeOutlineVisible(visible);
        root.classList.toggle("lively-mascot--outline-hidden", !outlineVisible);
        return outlineVisible;
      },
      setFaceVariant: function (variant) {
        var v = String(variant || "default").toLowerCase();
        if (v !== "simple" && v !== "dot") v = "default";
        root.classList.toggle("lively-mascot--face-default", v === "default");
        root.classList.toggle("lively-mascot--face-simple", v === "simple");
        root.classList.toggle("lively-mascot--face-dot", v === "dot");
        return v;
      },
      setTheme: function (p) {
        p = p || {};
        if (Object.prototype.hasOwnProperty.call(p, "body") && model.skin.slots.indexOf("body") !== -1) theme.body = p.body == null ? (defaultTheme.body || "") : String(p.body);
        if (Object.prototype.hasOwnProperty.call(p, "outline") && model.skin.slots.indexOf("outline") !== -1) theme.outline = p.outline == null ? (defaultTheme.outline || "") : String(p.outline);
        if (Object.prototype.hasOwnProperty.call(p, "accent") && model.skin.slots.indexOf("accent") !== -1) theme.accent = p.accent == null ? (defaultTheme.accent || "") : String(p.accent);
        applyTheme();
      },
      setEmotion: function (emotionId) {
        var id = normalizeEmotionId(emotionId);
        if (!LivelyEmotions[id]) throw new Error("Unknown emotion: " + id);
        setEmotionClass(id);
        rig.api.setEmotionState(id);
      },
      clearEmotion: function () {
        setEmotionClass("02");
        rig.api.setEmotionState("02");
      },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        rig.destroy();
        root.remove();
      }
    };
  }

  function defineMascotElement(tag) {
    tag = tag || "lively-mascot";
    if (typeof customElements === "undefined" || customElements.get(tag)) return;
    var _create = createMascot;
    var LivelyMascotElement = (function () {
      function LivelyMascotElement() {
        var _newTarget = this.constructor;
        var _this = Reflect.construct(HTMLElement, [], _newTarget);
        return _this;
      }
      LivelyMascotElement.prototype = Object.create(HTMLElement.prototype, {
        constructor: { value: LivelyMascotElement, writable: true, configurable: true }
      });
      LivelyMascotElement.observedAttributes = ["type", "color", "size", "view-mode", "mode", "show-outline"];
      LivelyMascotElement.prototype.connectedCallback = function () { this._render(); };
      LivelyMascotElement.prototype.disconnectedCallback = function () { if (this._inst) this._inst.destroy(); this._inst = null; this.textContent = ""; };
      LivelyMascotElement.prototype.attributeChangedCallback = function () { if (this.isConnected) this._render(); };
      LivelyMascotElement.prototype._render = function () {
        if (this._inst) this._inst.destroy();
        this.textContent = "";
        this._inst = _create(this, {
          type: this.getAttribute("type"),
          color: this.getAttribute("color"),
          size: this.getAttribute("size") ? Number(this.getAttribute("size")) : undefined,
          viewMode: this.getAttribute("view-mode") || this.getAttribute("mode") || undefined,
          outlineVisible: this.getAttribute("show-outline") !== "false"
        });
      };
      return LivelyMascotElement;
    })();
    customElements.define(tag, LivelyMascotElement);
  }

  return {
    createMascot: createMascot,
    defineModel: defineModel,
    defineEmotion: defineEmotion,
    defineMascotElement: defineMascotElement,
    buildFaceSvg: buildFaceSvg,
    models: models,
    partActions: STANDARD_ACTIONS,
    emotions: LivelyEmotions,
    emotionGroups: LivelyEmotionGroups,
    version: "0.3.1"
  };
});
