/**
 * lively-mascot · Cat Character
 *
 * A round cat with triangular ears, a curved tail, and whiskers.
 * Registers itself with the global LivelyMascot SDK.
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

  function renderCat(rig, rigEl) {
    // --- Ears: rounded cat ears, inner pink flush with head top ---
    var ears = hEl("span", { class: "lively__ears", "aria-hidden": "true" });
    var earLeft = svg("g", { class: "lively__ear-left" }, [
      // Triangular cat ear with a pointed tip and slightly curved sides
      svg("path", { class: "lively__ear", d: "M1 26 C2 13 6 3 10 1 C14 3 19 13 19 26 C13 28 6 28 1 26 Z" }),
      svg("path", { class: "lively__ear--inner", d: "M6 25 C6 16 8 9 10 7 C12 9 15 16 15 25 C11 26 8 26 6 25 Z" })
    ]);
    var earRight = svg("g", { class: "lively__ear-right" }, [
      svg("path", { class: "lively__ear", d: "M59 26 C58 13 54 3 50 1 C46 3 41 13 41 26 C47 28 54 28 59 26 Z" }),
      svg("path", { class: "lively__ear--inner", d: "M54 25 C54 16 52 9 50 7 C48 9 45 16 45 25 C49 26 52 26 54 25 Z" })
    ]);
    ears.appendChild(svg("svg", { viewBox: "0 0 60 26" }, [earLeft, earRight]));
    rig.registerLeaf(ears, { useLeafAnim: false }); // cat drives ears via its own CSS

    // --- Body ---
    var body = hEl("div", { class: "lively-body" });
    rig.registerBody(body);

    // --- Tail ---
    var tail = hEl("span", { class: "lively__tail", "aria-hidden": "true" });
    tail.appendChild(svg("svg", { viewBox: "0 0 40 40" }, [
      svg("path", { class: "lively-cat__tail-outline", d: "M4 36 C4 20, 18 10, 30 8 C36 7, 38 12, 34 16" }),
      svg("path", { class: "lively-cat__tail-path", d: "M4 36 C4 20, 18 10, 30 8 C36 7, 38 12, 34 16" }),
      svg("circle", { class: "lively-cat__tail-tip", cx: 34, cy: 16, r: 3.5 })
    ]));

    // --- Face (shared) ---
    var faceObj = LivelyMascot.buildFaceSvg(rig);
    var face = faceObj.face;

    // Cat nose (small triangle)
    face.appendChild(svg("path", { class: "lively-face__cat-nose", d: "M48 58 L50 55 L52 58 Z" }));

    // Whiskers (3 on each side)
    var whiskerYL = [56, 59, 62];
    var whiskerXR = [8, 10, 12];
    for (var i = 0; i < 3; i++) {
      face.appendChild(svg("line", { class: "lively-face__whisker", x1: 14, y1: whiskerYL[i], x2: whiskerXR[i], y2: whiskerYL[i] - 1 }));
      face.appendChild(svg("line", { class: "lively-face__whisker", x1: 86, y1: whiskerYL[i], x2: 88 + (12 - whiskerXR[i]), y2: whiskerYL[i] - 1 }));
    }

    body.appendChild(ears);
    body.appendChild(faceObj.wrap);
    rigEl.appendChild(body);
    rigEl.appendChild(tail);

    // --- Feet ---
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
  }

  // Register cat character when SDK is available
  if (typeof LivelyMascot !== "undefined") {
    LivelyMascot.registerCharacter("cat", renderCat, "Cat", "0 0 100 100");
  } else {
    // SDK not yet loaded; defer registration
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof LivelyMascot !== "undefined") {
        LivelyMascot.registerCharacter("cat", renderCat, "Cat", "0 0 100 100");
      }
    });
  }
})();
