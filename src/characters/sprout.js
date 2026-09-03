/**
 * lively-mascot · Sprout Character
 *
 * The classic leafy sprout: round body with a small plant
 * growing from the top of its head.
 *
 * Requires: core/dom.js and lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var dom = typeof LivelyDom !== "undefined" ? LivelyDom : {};
  var svg = dom.svg;
  var hEl = dom.hEl;

  function renderSprout(model, rigEl) {
    // Leaf (top decoration, data-driven by emotion leafAnim)
    var leaf = hEl("span", { class: "lively__leaf", "aria-hidden": "true" });
    model.registerPart("top", leaf);
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
    model.registerPart("body", body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(model);
    body.appendChild(leaf);
    body.appendChild(face.wrap);
    rigEl.appendChild(body);

    // Feet
    var feet = hEl("div", { class: "lively__feet" });
    model.registerPart("feet", feet);
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

  function register() {
    if (typeof LivelyMascot === "undefined") return;
    var actions = LivelyMascot.partActions;
    LivelyMascot.defineModel({
      id: "sprout", name: "Sprout", viewBox: "0 0 100 100", render: renderSprout,
      presentation: { icon: "\u{1F331}", labels: { zh: "嫩芽", en: "Sprout" }, greeting: { zh: "嫩芽", en: "Sprout" }, order: 0, theme: { body: "#48ff42", outline: "#080808", accent: "#ff9fb6" } },
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth }, top: { actions: actions.top }, feet: { actions: actions.feet } },
      skin: { slots: ["body", "outline", "accent"] },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 14 }, face: { x: 50, y: 48 }, body: { x: 50, y: 58 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
