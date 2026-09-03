/**
 * lively-mascot · Jelly Character
 *
 * A pure jelly blob — no leaf, no feet. Only a translucent body
 * with a jiggly squash-stretch idle animation.
 *
 * Requires: core/dom.js and lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var dom = typeof LivelyDom !== "undefined" ? LivelyDom : {};
  var svg = dom.svg;
  var hEl = dom.hEl;

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
      presentation: { icon: "\u{1F7E2}", labels: { zh: "果冻", en: "Jelly" }, greeting: { zh: "啵！", en: "Plop!" }, order: 4, theme: { body: "#f29cc2", outline: "#5a243e", accent: "#ffe0a8" } },
      rig: { hop: false },
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth } },
      skin: { slots: ["body", "outline", "accent"] },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 24 }, face: { x: 50, y: 49 }, body: { x: 50, y: 60 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
