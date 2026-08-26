/**
 * lively-mascot · Core Animation Rig
 *
 * Handles gaze tracking, blinking, hopping, and emotion state management.
 * This is the "engine" that drives the mascot's movement.
 *
 * Requires: src/core/emotions.js (loaded before this script)
 * Globals: LivelyEmotions (from emotions.js), clamp (defined below)
 */

// --- Helpers ---
var clamp = function (v, min, max) { return v < min ? min : v > max ? max : v; };

// --- Core Rig ---
function createRig(root, rigEl, config, handlers) {
  config = config || {};
  handlers = handlers || {};
  var animated = config.animated !== false;
  var followCursor = config.followCursor !== false;
  var gazeRadiusX = config.gazeRadiusX || 200;
  var gazeRadiusY = config.gazeRadiusY || 160;
  var currentHopInterval = config.hopInterval === undefined ? [6, 13] : config.hopInterval;
  var pupils = [];
  var eyes = [];
  var face = null;
  var happy = false;
  var hopping = false;
  var following = animated && followCursor;
  var currentEmotionId = "02"; // Default idle
  var bodyEl = null;
  var leafEl = null;
  var leafUseLeafAnim = true;
  var feetEl = null;
  var gazeEl = null;
  var faceAccessories = {};
  var activeFaceAccessory = null;

  var api = {
    registerPupil: function (elm, spec) {
      for (var i = 0; i < pupils.length; i++) { if (pupils[i].el === elm) { pupils[i].spec = spec; return; } }
      pupils.push({ el: elm, spec: spec || { maxX: 8, maxY: 6 } });
    },
    registerEye: function (elm) { if (eyes.indexOf(elm) === -1) eyes.push(elm); },
    registerFace: function (elm) { face = elm; },
    registerBody: function (elm) { bodyEl = elm; },
    registerLeaf: function (elm, opts) {
      leafEl = elm;
      // sprout uses its emotion `leafAnim` data; cat drives ears via its own CSS.
      leafUseLeafAnim = !(opts && opts.useLeafAnim === false);
    },
    registerFeet: function (elm) { feetEl = elm; },
    registerGazeWrap: function (elm) { gazeEl = elm; },
    registerFaceAccessory: function (name, elm) {
      if (!name || !elm) return;
      faceAccessories[String(name)] = elm;
      elm.classList.add("lively-face-accessory");
      if (activeFaceAccessory === null) activeFaceAccessory = String(name);
      elm.classList.toggle("is-active", activeFaceAccessory === String(name));
    },
    setFaceAccessory: function (name) {
      var key = name == null ? null : String(name);
      activeFaceAccessory = key;
      for (var accessoryName in faceAccessories) {
        if (Object.prototype.hasOwnProperty.call(faceAccessories, accessoryName)) {
          faceAccessories[accessoryName].classList.toggle("is-active", accessoryName === key);
        }
      }
    },
    setEmotionState: function (id) {
      currentEmotionId = String(id);
      applyEmotionBehavior(currentEmotionId);
      syncHop();
    }
  };

  function setHappy(v) { if (happy === v) return; happy = v; root.classList.toggle("is-happy", v); }
  function setHopping(v) { if (hopping === v) return; hopping = v; root.classList.toggle("is-hopping", v); }

  // --- Emotion Behavior ---
  function getEmotionDef(id) { return LivelyEmotions[String(id)]; }

  function clearEmotionBehavior() {
    if (bodyEl) { bodyEl.style.animation = ""; bodyEl.style.filter = ""; }
    rigEl.style.animation = "";
    if (leafEl && leafUseLeafAnim) { leafEl.style.animation = ""; }
    if (feetEl) {
      feetEl.style.removeProperty("--lively-state-filter");
      var footL = feetEl.querySelector(".lively__foot--l");
      var footR = feetEl.querySelector(".lively__foot--r");
      if (footL) footL.style.animation = "";
      if (footR) footR.style.animation = "";
    }
  }

  function applyEmotionBehavior(id) {
    var def = getEmotionDef(id);
    if (!def) { clearEmotionBehavior(); return; }
    // Static mode: the visible face is driven by the `is-emotion-XX` class
    // (set on the root by the SDK), so we keep that but apply no motion —
    // no body/leaf/foot animation and no filter flicker.
    if (!animated) {
      if (bodyEl) bodyEl.style.filter = def.bodyFilter || "";
      if (feetEl) feetEl.style.setProperty("--lively-state-filter", def.bodyFilter || "brightness(1)");
      return;
    }
    // Body
    if (bodyEl) {
      bodyEl.style.animation = def.bodyAnim || "";
      bodyEl.style.filter = def.bodyFilter || "";
    }
    // Leaf (top decoration). Only drive it from emotion data when the
    // character opts in (sprout). Cat drives its ears via its own CSS rules.
    if (leafEl && leafUseLeafAnim) {
      leafEl.style.animation = def.leafAnim || "";
    }
    // Feet
    if (feetEl) {
      feetEl.style.setProperty("--lively-state-filter", def.bodyFilter || "brightness(1)");
      var footL = feetEl.querySelector(".lively__foot--l");
      var footR = feetEl.querySelector(".lively__foot--r");
      if (footL) footL.style.animation = def.footAnim || "";
      if (footR) footR.style.animation = def.footAnim || "";
    }
    // Refresh (06) + Loading (28): drive the entire rig (whole mascot
    // bounces / rotates with feet attached) instead of just the body.
    if (id === "06" || id === "28") {
      if (bodyEl) bodyEl.style.animation = "";
      rigEl.style.animation = def.bodyAnim || "";
    } else {
      // Everything else: keep the rig stationary so overlays line up.
      rigEl.style.animation = "";
    }
  }

  // --- Gaze ---
  var raf = 0, rect = root.getBoundingClientRect(), rectAt = performance.now();
  var targetX = 0, targetY = 0, curX = 0, curY = 0;

  function shouldGaze() {
    // Explicit gaze:false emotions
    var def = getEmotionDef(currentEmotionId);
    if (def && def.gaze === false) return false;
    // All active emotions (non-idle) pause gaze following
    if (currentEmotionId !== "02") return false;
    return following;
  }

  function onPointerMove(e) {
    if (!shouldGaze()) return;
    var now = performance.now();
    if (now - rectAt > 250) { rect = root.getBoundingClientRect(); rectAt = now; }
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    targetX = clamp((e.clientX - cx) / gazeRadiusX, -1, 1);
    targetY = clamp((e.clientY - cy) / gazeRadiusY, -1, 1);
  }

  function tick() {
    if (!shouldGaze()) { targetX = 0; targetY = 0; }
    curX += (targetX - curX) * 0.2;
    curY += (targetY - curY) * 0.2;
    for (var i = 0; i < pupils.length; i++) {
      var p = pupils[i];
      p.el.setAttribute("transform", "translate(" + (curX * p.spec.maxX).toFixed(2) + " " + (curY * p.spec.maxY).toFixed(2) + ")");
    }
    if (face) face.setAttribute("transform", "rotate(" + (curX * 3).toFixed(2) + " 50 52)");
    var postureEl = gazeEl || rigEl;
    if (root.classList.contains("lively-mascot--3d")) {
      // Keep the character's parts in one shared 3D posture layer. Pointer
      // position steers the turn, while active expressions retain a subtle
      // living tilt after gaze tracking has intentionally paused.
      var emotionPhase = performance.now() / 720 + Number(currentEmotionId || 0) * 0.67;
      var emotionPitch = currentEmotionId === "02" ? 0 : Math.sin(emotionPhase) * 1.2;
      var emotionYaw = currentEmotionId === "02" ? 0 : Math.cos(emotionPhase * 0.82) * 1.7;
      var pitch = 3.2 - curY * 7.2 + emotionPitch;
      var yaw = -3.2 + curX * 9.4 + emotionYaw;
      // A flat SVG silhouette naturally narrows at a camera angle. Gently
      // compensate that projection so the mascot keeps its rounded volume.
      var volumeX = 1 + Math.abs(yaw) * 0.0027;
      var volumeY = 1 + Math.abs(pitch) * 0.0022;
      root.style.setProperty("--lively-gloss-x", (25 + curX * 15).toFixed(1) + "%");
      root.style.setProperty("--lively-gloss-y", (18 + curY * 12).toFixed(1) + "%");
      postureEl.style.transform = "translate3d(" + (curX * 2.2).toFixed(1) + "px, " + (curY * 1.4).toFixed(1) + "px, 3px) scale3d(" + volumeX.toFixed(3) + ", " + volumeY.toFixed(3) + ", 1) rotateZ(" + (curX * 1.8).toFixed(2) + "deg) rotateX(" + pitch.toFixed(2) + "deg) rotateY(" + yaw.toFixed(2) + "deg)";
    } else {
      postureEl.style.transform = "rotate(" + (curX * 5).toFixed(2) + "deg) translate3d(" + (curX * 4).toFixed(1) + "px, " + (curY * 2.5).toFixed(1) + "px, 0)";
    }
    raf = requestAnimationFrame(tick);
  }

  // --- Blink ---
  var blinkTimer = 0, phaseTimer = 0;
  function scheduleBlink() {
    var def = getEmotionDef(currentEmotionId);
    // No blink if disabled
    if (def && def.blink === false) {
      blinkTimer = window.setTimeout(scheduleBlink, 300);
      return;
    }
    var blinkDelay = def && def.blink === "fast" ? 800 + Math.random() * 1200 : 2200 + Math.random() * 2600;
    blinkTimer = window.setTimeout(function () {
      for (var i = 0; i < eyes.length; i++) eyes[i].classList.add("is-blinking");
      phaseTimer = window.setTimeout(function () {
        for (var i = 0; i < eyes.length; i++) eyes[i].classList.remove("is-blinking");
        if (Math.random() < 0.18) {
          phaseTimer = window.setTimeout(function () {
            for (var i = 0; i < eyes.length; i++) eyes[i].classList.add("is-blinking");
            phaseTimer = window.setTimeout(function () {
              for (var i = 0; i < eyes.length; i++) eyes[i].classList.remove("is-blinking");
              scheduleBlink();
            }, 90);
          }, 160);
        } else scheduleBlink();
      }, 110);
    }, blinkDelay);
  }

  // --- Hop ---
  var hopTimer = 0, hopResetTimer = 0;

  // A hop is an expression-specific action, never a background interruption.
  function canHop() {
    var def = getEmotionDef(currentEmotionId);
    return animated && !!currentHopInterval && !!(def && def.hop);
  }

  function stopHop() {
    clearTimeout(hopTimer);
    clearTimeout(hopResetTimer);
    hopTimer = 0;
    hopResetTimer = 0;
    setHopping(false);
  }

  function scheduleHop() {
    if (!canHop()) return;
    hopTimer = window.setTimeout(function () {
      if (!canHop()) return;
      setHopping(true);
      hopResetTimer = window.setTimeout(function () {
        setHopping(false);
        scheduleHop();
      }, 900);
    }, currentHopInterval[0] * 1000 + Math.random() * (currentHopInterval[1] - currentHopInterval[0]) * 1000);
  }

  function syncHop() {
    stopHop();
    scheduleHop();
  }

  function fireClick() {
    if (handlers.onClick) handlers.onClick();
    // Skip happy flash if a non-idle emotion is active (avoid face overlap)
    if (currentEmotionId !== "02") return;
    setHappy(true);
    setTimeout(function(){ setHappy(false); }, 950);
  }

  if (following) { raf = requestAnimationFrame(tick); window.addEventListener("pointermove", onPointerMove, { passive: true }); }
  if (animated) {
    scheduleBlink();
    syncHop();
    root.addEventListener("pointerdown", fireClick);
  }

  return {
    api: api,
    click: fireClick,
    setFollowCursor: function(e){ following=e; },
    destroy: function() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      clearTimeout(blinkTimer); clearTimeout(phaseTimer);
      clearTimeout(hopTimer); clearTimeout(hopResetTimer);
    }
  };
}

// The browser build still uses the top-level function. Exporting it here
// also lets the CommonJS SDK entry assemble the same runtime in Node.
if (typeof module === "object" && module.exports) module.exports = { createRig: createRig };
if (typeof globalThis !== "undefined") globalThis.createRig = createRig;
