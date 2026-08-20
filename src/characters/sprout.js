/**
 * lively-mascot · Sprout Character
 *
 * The classic leafy sprout: round body with a small plant
 * growing from the top of its head.
 *
 * Requires: lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svg(tag, attrs, children) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, String(attrs[k]));
    if (children) for (var i = 0; i < children.length; i++) el.appendChild(children[i]);
    return el;
  }
  function hEl(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        var v = attrs[k];
        if (v === undefined || v === null || v === "") continue;
        if (k === "class") node.className = String(v);
        else if (k === "text") node.textContent = String(v);
        else node.setAttribute(k, String(v));
      }
    }
    if (children) for (var i = 0; i < children.length; i++) node.appendChild(children[i]);
    return node;
  }

  function renderSprout(rig, rigEl) {
    var clipId = "lively-eye-clip-" + Math.random().toString(36).slice(2, 9);

    // Leaf
    var leaf = hEl("span", { class: "lively__leaf", "aria-hidden": "true" });
    rig.registerLeaf(leaf);
    leaf.appendChild(svg("svg", { viewBox: "0 0 52 56" }, [
      svg("path", { class: "lively-sprout__stem", d: "M26 52 C26 42, 26 34, 26 27" }),
      svg("path", { class: "lively-sprout__leaf", d: "M26 28 C22 15, 14 9, 6 12 C5 20, 12 29, 26 28 Z" }),
      svg("path", { class: "lively-sprout__vein", d: "M23 26 C18 21, 12 16, 8 14" }),
      svg("path", { class: "lively-sprout__shine", d: "M22 26 C16 16, 11 12, 7 14" }),
      svg("path", { class: "lively-sprout__leaf", d: "M26 28 C30 15, 38 9, 46 12 C47 20, 40 29, 26 28 Z" }),
      svg("path", { class: "lively-sprout__vein", d: "M29 26 C34 21, 40 16, 44 14" }),
      svg("path", { class: "lively-sprout__shine", d: "M30 26 C36 16, 41 12, 45 14" })
    ]));

    // Body
    var body = hEl("div", { class: "lively-body" });
    rig.registerBody(body);

    // Face
    var face = svg("g", { class: "lively-face" });
    rig.registerFace(face);
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 20, cy: 57, rx: 7, ry: 4 }));
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 80, cy: 57, rx: 7, ry: 4 }));

    function buildEye(cx, cy) {
      var wrapper = svg("g", { transform: "translate(" + cx + " " + cy + ")" });
      var eye = svg("g", { class: "lively-face__eye" });
      rig.registerEye(eye);
      eye.appendChild(svg("ellipse", { rx: 10, ry: 11.5 }));
      var clip = svg("g", { "clip-path": "url(#" + clipId + ")" });
      var pupil = svg("g");
      rig.registerPupil(pupil, { maxX: 8, maxY: 6 });
      pupil.appendChild(svg("circle", { class: "lively-face__pupil", r: 6.2 }));
      pupil.appendChild(svg("circle", { class: "lively-face__shine", cx: 2.2, cy: -2.4, r: 2.1 }));
      clip.appendChild(pupil);
      eye.appendChild(clip);
      eye.appendChild(svg("path", { class: "lively-face__happy", d: "M-6.5 1.5 Q0 -6 6.5 1.5" }));
      wrapper.appendChild(eye);
      return wrapper;
    }
    face.appendChild(buildEye(34, 43));
    face.appendChild(buildEye(66, 43));
    // Default mouth
    face.appendChild(svg("path", { class: "lively-face__mouth", d: "M42 63 Q50 70 58 63" }));
    // Happy mouth
    face.appendChild(svg("path", { class: "lively-face__happy-mouth", d: "M40 61 Q50 74 60 61 Q50 66 40 61 Z" }));
    // Sad mouth
    face.appendChild(svg("path", { class: "lively-face__sad-mouth", d: "M43 67 Q50 62 57 67" }));
    // Open mouth
    face.appendChild(svg("ellipse", { class: "lively-face__open-mouth", cx: 50, cy: 65, rx: 5, ry: 6 }));
    // Flat mouth
    face.appendChild(svg("line", { class: "lively-face__flat-mouth", x1: 43, y1: 65, x2: 57, y2: 65 }));
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
    var faceWrap = hEl("div", { class: "lively-face-wrap" });
    faceWrap.appendChild(faceSvg);

    body.appendChild(leaf);
    body.appendChild(faceWrap);
    rigEl.appendChild(body);

    // Feet
    var feet = hEl("div", { class: "lively__feet" });
    rig.registerFeet(feet);
    var footL = hEl("span", { class: "lively__foot lively__foot--l" });
    footL.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("ellipse", { class: "lively-foot__body", cx: 11, cy: 10, rx: 10, ry: 6 }),
      svg("ellipse", { class: "lively-foot__shine", cx: 8, cy: 7, rx: 3, ry: 1.8 })
    ]));
    var footR = hEl("span", { class: "lively__foot lively__foot--r" });
    footR.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("ellipse", { class: "lively-foot__body", cx: 11, cy: 10, rx: 10, ry: 6 }),
      svg("ellipse", { class: "lively-foot__shine", cx: 8, cy: 7, rx: 3, ry: 1.8 })
    ]));
    feet.appendChild(footL);
    feet.appendChild(footR);
    rigEl.appendChild(feet);

    // Loading spinner overlay (hidden by default, shown via .is-emotion-28)
    var loadingOverlay = hEl("span", { class: "lively__loading-overlay", "aria-hidden": "true" });
    rigEl.appendChild(loadingOverlay);
  }

  // Register sprout character when SDK is available
  if (typeof LivelyMascot !== "undefined") {
    LivelyMascot.registerCharacter("sprout", renderSprout, "Sprout", "0 0 100 100");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof LivelyMascot !== "undefined") {
        LivelyMascot.registerCharacter("sprout", renderSprout, "Sprout", "0 0 100 100");
      }
    });
  }
})();
