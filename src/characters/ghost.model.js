/**
 * lively-mascot · Ghost Character
 *
 * A floating, semi-transparent spirit. No feet — instead the foot
 * channel is repurposed into a wavy tail/hem at the bottom.
 * Structurally the simplest character.
 *
 * Requires: core/dom.js and lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var dom = typeof LivelyDom !== "undefined" ? LivelyDom : {};
  var svg = dom.svg;
  var hEl = dom.hEl;

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
      presentation: { icon: "\u{1F47B}", labels: { zh: "幽灵", en: "Ghost" }, greeting: { zh: "呜~", en: "Boo!" }, order: 3, theme: { body: "#bdeef2", outline: "#23434d", accent: "#a9d9ff" } },
      rig: { hop: false },
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth } },
      skin: { slots: ["body", "outline", "accent"] },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 20 }, face: { x: 50, y: 49 }, body: { x: 50, y: 58 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
