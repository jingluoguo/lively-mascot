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

  function renderGhost(model, gazeEl) {
    // Body (floating blob, no hard shadow)
    var body = hEl("div", { class: "lively-body lively-body--ghost" });
    model.registerPart("body", body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(model);
    body.appendChild(face.wrap);

    // The body CSS owns the filled wavy silhouette. This SVG adds only the
    // optional ink line for outline mode, so the lower edge stays seamless.
    var hem = hEl("div", { class: "lively__ghost-hem" });
    hem.appendChild(svg("svg", { viewBox: "0 0 100 6", preserveAspectRatio: "none" }, [
      svg("path", {
        class: "lively-ghost__hem-stroke",
        d: "M0 0 C11.1 6 22.2 6 33.3 0 C44.4 6 55.6 6 66.7 0 C77.8 6 88.9 6 100 0"
      })
    ]));
    body.appendChild(hem);

    gazeEl.appendChild(body);
  }

  function register() {
    if (typeof LivelyMascot === "undefined") return;
    var actions = LivelyMascot.partActions;
    LivelyMascot.defineModel({
      id: "ghost", name: "Ghost", viewBox: "0 0 100 100", render: renderGhost,
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth } },
      skin: { slots: ["body", "outline", "accent"] },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 20 }, face: { x: 50, y: 49 }, body: { x: 50, y: 58 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
