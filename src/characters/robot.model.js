/**
 * lively-mascot · Robot Character
 *
 * A square-headed robot with an antenna and a glowing tip.
 * Tech vibe: hard corners, segmented body, mechanical feet.
 *
 * Requires: core/dom.js and lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var dom = typeof LivelyDom !== "undefined" ? LivelyDom : {};
  var svg = dom.svg;
  var hEl = dom.hEl;

  function renderRobot(model, rigEl) {
    // Antenna: reuse the "leaf" channel so it follows the body posture.
    // CSS drives the bob + tip glow (useLeafAnim:false).
    var antenna = hEl("span", { class: "lively__antenna", "aria-hidden": "true" });
    model.registerPart("top", antenna, { useEmotionAnimation: false });
    antenna.appendChild(svg("svg", { viewBox: "0 0 40 36" }, [
      svg("line", { class: "lively-robot__antenna-stalk", x1: 20, y1: 34, x2: 20, y2: 8 }),
      svg("circle", { class: "lively-robot__antenna-ball", cx: 20, cy: 5, r: 5 })
    ]));

    // Body (square head)
    var body = hEl("div", { class: "lively-body lively-body--robot" });
    model.registerPart("body", body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(model);
    body.appendChild(antenna);
    body.appendChild(face.wrap);
    rigEl.appendChild(body);

    // Feet (mechanical blocks)
    var feet = hEl("div", { class: "lively__feet lively__feet--robot" });
    model.registerPart("feet", feet);
    var footL = hEl("span", { class: "lively__foot lively__foot--l" });
    footL.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("rect", { class: "lively-robot__foot", x: 1, y: 3, width: 20, height: 12, rx: 3 }),
      svg("rect", { class: "lively-robot__foot-line", x: 4, y: 7, width: 14, height: 2, rx: 1 })
    ]));
    var footR = hEl("span", { class: "lively__foot lively__foot--r" });
    footR.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("rect", { class: "lively-robot__foot", x: 1, y: 3, width: 20, height: 12, rx: 3 }),
      svg("rect", { class: "lively-robot__foot-line", x: 4, y: 7, width: 14, height: 2, rx: 1 })
    ]));
    feet.appendChild(footL);
    feet.appendChild(footR);
    rigEl.appendChild(feet);
  }

  function register() {
    if (typeof LivelyMascot === "undefined") return;
    var actions = LivelyMascot.partActions;
    LivelyMascot.defineModel({
      id: "robot", name: "Robot", viewBox: "0 0 100 100", render: renderRobot,
      presentation: { icon: "\u{1F916}", labels: { zh: "机器人", en: "Robot" }, greeting: { zh: "哔哔！", en: "Beep!" }, order: 2, theme: { body: "#6f879b", outline: "#162332", accent: "#74e5ff" } },
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth }, top: { actions: actions.top }, feet: { actions: actions.feet } },
      skin: { slots: ["body", "outline", "accent"], fixed: { cheek: "#e7ad76" } },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 9 }, face: { x: 50, y: 45 }, body: { x: 50, y: 57 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
