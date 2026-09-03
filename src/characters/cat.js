/**
 * lively-mascot · Cat Character
 *
 * A round cat with triangular ears, a curved tail, and whiskers.
 * Registers itself with the global LivelyMascot SDK.
 *
 * Requires: core/dom.js and lively-mascot.js (loaded before this script)
 */
(function () {
  "use strict";

  var dom = typeof LivelyDom !== "undefined" ? LivelyDom : {};
  var svg = dom.svg;
  var hEl = dom.hEl;

  function renderCat(model, rigEl) {
    // --- Ears: tall, pointed cat ears ---
    var ears = hEl("span", { class: "lively__ears", "aria-hidden": "true" });
    var earLeft = svg("g", { class: "lively__ear-left" }, [
      svg("path", { class: "lively__ear", d: "M1 30 C2 17 5 6 10 1 Q11 0 13 3 C18 14 20 24 20 30 C13 32 6 32 1 30 Z" }),
      svg("path", { class: "lively__ear--inner", d: "M6 28 C6 19 8 10 10 6 Q11 5 12 7 C15 15 16 23 16 28 C12 29 9 29 6 28 Z" })
    ]);
    var earRight = svg("g", { class: "lively__ear-right" }, [
      svg("path", { class: "lively__ear", d: "M59 30 C58 17 55 6 50 1 Q49 0 47 3 C42 14 40 24 40 30 C47 32 54 32 59 30 Z" }),
      svg("path", { class: "lively__ear--inner", d: "M54 28 C54 19 52 10 50 6 Q49 5 48 7 C45 15 44 23 44 28 C48 29 51 29 54 28 Z" })
    ]);
    ears.appendChild(svg("svg", { viewBox: "0 0 60 32" }, [earLeft, earRight]));
    model.registerPart("top", ears, { useEmotionAnimation: false }); // cat drives ears via its own CSS

    // --- Body ---
    var body = hEl("div", { class: "lively-body lively-body--cat" });
    model.registerPart("body", body);

    // --- Tail ---
    var tail = hEl("span", { class: "lively__tail", "aria-hidden": "true" });
    model.registerPart("tail", tail);
    // The tail begins well inside the body silhouette. Its visible curve can
    // therefore emerge from behind the flank instead of ending at the edge.
    tail.appendChild(svg("svg", { viewBox: "0 0 52 58" }, [
      svg("g", { class: "lively-cat__tail-motion" }, [
        svg("path", { class: "lively-cat__tail-outline", d: "M-10 56 C-7 40, 0 25, 17 16 C28 10, 43 11, 46 20 C48 27, 42 32, 35 28" }),
        svg("path", { class: "lively-cat__tail-path", d: "M-10 56 C-7 40, 0 25, 17 16 C28 10, 43 11, 46 20 C48 27, 42 32, 35 28" }),
        svg("circle", { class: "lively-cat__tail-tip", cx: 35, cy: 28, r: 3.2 })
      ])
    ]));

    // --- Face (shared) ---
    var faceObj = LivelyMascot.buildFaceSvg(model);
    var face = faceObj.face;

    // A small warm muzzle keeps the dark cat readable without making the
    // cheeks look like a second pair of eyes.
    face.insertBefore(svg("ellipse", { class: "lively-cat__muzzle", cx: 38, cy: 61, rx: 10, ry: 6 }), face.firstChild);
    face.insertBefore(svg("ellipse", { class: "lively-cat__muzzle", cx: 62, cy: 61, rx: 10, ry: 6 }), face.firstChild);

    // Cat nose: inverted triangle with a short philtrum.
    face.appendChild(svg("path", { class: "lively-face__cat-nose-bridge", d: "M50 59 L50 63" }));
    face.appendChild(svg("path", { class: "lively-face__cat-nose", d: "M46 57 Q50 55 54 57 L50 61 Z" }));


    // Floating whiskers are intentionally separate from the face so they can
    // drift independently, like fine paper-cutout filaments in the air.
    var whiskers = hEl("span", { class: "lively-cat__whiskers", "aria-hidden": "true" });
    whiskers.appendChild(svg("svg", { viewBox: "0 0 100 100" }, [
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--l1", d: "M34 57 C24 53 17 50 9 50" }),
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--l2", d: "M33 61 C22 60 15 60 7 62" }),
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--l3", d: "M34 65 C24 67 18 70 11 74" }),
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--r1", d: "M66 57 C76 53 83 50 91 50" }),
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--r2", d: "M67 61 C78 60 85 60 93 62" }),
      svg("path", { class: "lively-cat__whisker lively-cat__whisker--r3", d: "M66 65 C76 67 82 70 89 74" })
    ]));
    model.registerPart("accessory", whiskers);

    body.appendChild(ears);
    body.appendChild(faceObj.wrap);
    body.appendChild(whiskers);
    rigEl.appendChild(body);
    rigEl.appendChild(tail);

    // --- Feet ---
    var feet = hEl("div", { class: "lively__feet" });
    model.registerPart("feet", feet);
    var footL = hEl("span", { class: "lively__foot lively__foot--l" });
    footL.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("ellipse", { class: "lively-foot__body", cx: 11, cy: 10, rx: 10, ry: 6 }),
      svg("ellipse", { class: "lively-foot__shine", cx: 8, cy: 7, rx: 3, ry: 1.8 }),
      svg("path", { class: "lively-cat__toe-lines", d: "M7 10 Q7 8 8 7 M11 11 Q11 9 12 8 M15 10 Q15 8 16 7" })
    ]));
    var footR = hEl("span", { class: "lively__foot lively__foot--r" });
    footR.appendChild(svg("svg", { viewBox: "0 0 22 16" }, [
      svg("ellipse", { class: "lively-foot__body", cx: 11, cy: 10, rx: 10, ry: 6 }),
      svg("ellipse", { class: "lively-foot__shine", cx: 8, cy: 7, rx: 3, ry: 1.8 }),
      svg("path", { class: "lively-cat__toe-lines", d: "M7 10 Q7 8 8 7 M11 11 Q11 9 12 8 M15 10 Q15 8 16 7" })
    ]));
    feet.appendChild(footL);
    feet.appendChild(footR);
    rigEl.appendChild(feet);
  }

  function register() {
    if (typeof LivelyMascot === "undefined") return;
    var actions = LivelyMascot.partActions;
    LivelyMascot.defineModel({
      id: "cat", name: "Cat", viewBox: "0 0 100 100", render: renderCat,
      presentation: { icon: "\u{1F431}", labels: { zh: "小猫", en: "Cat" }, greeting: { zh: "喵！", en: "Meow!" }, order: 1, theme: { body: "#3d4852", outline: "#131a20", accent: "#eeb3c1" } },
      parts: { body: { actions: actions.body }, eyes: { actions: actions.eyes }, pupils: { actions: [] }, face: { actions: [] }, mouth: { actions: actions.mouth }, top: { actions: actions.top }, feet: { actions: actions.feet }, tail: { actions: actions.tail }, accessory: { actions: actions.accessory } },
      skin: { slots: ["body", "outline", "accent"], fixed: { pupil: "#17212a", muzzle: "#eee5d9" } },
      effects: { supported: ["hearts", "sparkles", "sleep", "loading"], anchors: { head: { x: 50, y: 9 }, face: { x: 50, y: 47 }, body: { x: 50, y: 58 }, feet: { x: 50, y: 88 } } }
    });
  }
  register();
  if (typeof LivelyMascot === "undefined") document.addEventListener("DOMContentLoaded", register);
})();
