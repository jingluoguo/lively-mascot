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
    setEmotionState: function (id) {
      currentEmotionId = String(id);
      applyEmotionBehavior(currentEmotionId);
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
      var footL = feetEl.querySelector(".lively__foot--l");
      var footR = feetEl.querySelector(".lively__foot--r");
      if (footL) footL.style.animation = def.footAnim || "";
      if (footR) footR.style.animation = def.footAnim || "";
    }
    // Refresh: rotate entire rig instead of just body
    if (id === "06") {
      if (bodyEl) bodyEl.style.animation = "";
      rigEl.style.animation = def.bodyAnim || "";
    } else {
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
    (gazeEl || rigEl).style.transform = "rotate(" + (curX * 5).toFixed(2) + "deg) translate3d(" + (curX * 4).toFixed(1) + "px, " + (curY * 2.5).toFixed(1) + "px, 0)";
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
  function scheduleHop() {
    if (!currentHopInterval) return;
    hopTimer = window.setTimeout(function () {
      setHopping(true);
      hopResetTimer = window.setTimeout(function () { setHopping(false); scheduleHop(); }, 900);
    }, currentHopInterval[0] * 1000 + Math.random() * (currentHopInterval[1] - currentHopInterval[0]) * 1000);
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
    scheduleHop();
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
