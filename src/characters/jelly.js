/**
 * lively-mascot · Jelly Character
 *
 * A pure jelly blob — no leaf, no feet. Only a translucent body
 * with a jiggly squash-stretch idle animation.
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

  function renderJelly(model, rigEl) {
    // Body (pure jelly blob)
    var body = hEl("div", { class: "lively-body lively-body--jelly" });
    model.registerPart("body", body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(model);
    body.appendChild(face.wrap);
    rigEl.appendChild(body);
  }

  function register() {
    if (typeof LivelyMascot === "undefined") return;
    var actions = LivelyMascot.partActions;
    LivelyMascot.defineModel({
      id: "jelly", name: "Jelly", viewBox: "0 0 100 100", render: renderJelly,
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth } },
      skin: { slots: ["body", "outline", "accent"] },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 24 }, face: { x: 50, y: 49 }, body: { x: 50, y: 60 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
