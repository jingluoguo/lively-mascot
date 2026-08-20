/**
 * lively-mascot · Ghost Character
 *
 * A floating, semi-transparent spirit. No feet — instead the foot
 * channel is repurposed into a wavy tail/hem at the bottom.
 * Structurally the simplest character.
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

  function renderGhost(rig, gazeEl) {
    // Body (floating blob, no hard shadow)
    var body = hEl("div", { class: "lively-body lively-body--ghost" });
    rig.registerBody(body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(rig);
    body.appendChild(face.wrap);

    // Wavy hem is a CHILD of the body, not a sibling. That way it rides
    // the same float/squish transform as the body and can never detach.
    // The filled band merges with the body fill (same color) and covers
    // the body's bottom outline; only the wavy bottom edge is stroked.
    // Three gentle, broad lobes read as a classic ghost tail instead of
    // the ball-with-tentacles look.
    var hem = hEl("div", { class: "lively__ghost-hem" });
    hem.appendChild(svg("svg", { viewBox: "0 0 100 14", preserveAspectRatio: "none" }, [
      svg("path", {
        class: "lively-ghost__hem-fill",
        d: "M0 0 H100 V5 q -16.7 9 -33.3 0 q -16.7 9 -33.3 0 q -16.7 9 -33.4 0 Z"
      }),
      svg("path", {
        class: "lively-ghost__hem-stroke",
        d: "M0 0 V5 q 16.7 9 33.3 0 q 16.7 9 33.3 0 q 16.7 9 33.4 0 V0"
      })
    ]));
    body.appendChild(hem);

    gazeEl.appendChild(body);
  }

  if (typeof LivelyMascot !== "undefined") {
    LivelyMascot.registerCharacter("ghost", renderGhost, "Ghost", "0 0 100 100");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof LivelyMascot !== "undefined") {
        LivelyMascot.registerCharacter("ghost", renderGhost, "Ghost", "0 0 100 100");
      }
    });
  }
})();
