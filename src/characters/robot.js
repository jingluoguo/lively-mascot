/**
 * lively-mascot · Robot Character
 *
 * A square-headed robot with an antenna and a glowing tip.
 * Tech vibe: hard corners, segmented body, mechanical feet.
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

  function renderRobot(rig, rigEl) {
    // Antenna: reuse the "leaf" channel so it follows the body posture.
    // CSS drives the bob + tip glow (useLeafAnim:false).
    var antenna = hEl("span", { class: "lively__antenna", "aria-hidden": "true" });
    rig.registerLeaf(antenna, { useLeafAnim: false });
    antenna.appendChild(svg("svg", { viewBox: "0 0 40 36" }, [
      svg("line", { class: "lively-robot__antenna-stalk", x1: 20, y1: 34, x2: 20, y2: 8 }),
      svg("circle", { class: "lively-robot__antenna-ball", cx: 20, cy: 5, r: 5 })
    ]));

    // Body (square head)
    var body = hEl("div", { class: "lively-body lively-body--robot" });
    rig.registerBody(body);

    // Shared face
    var face = LivelyMascot.buildFaceSvg(rig);
    body.appendChild(antenna);
    body.appendChild(face.wrap);
    rigEl.appendChild(body);

    // Feet (mechanical blocks)
    var feet = hEl("div", { class: "lively__feet lively__feet--robot" });
    rig.registerFeet(feet);
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

  if (typeof LivelyMascot !== "undefined") {
    LivelyMascot.registerCharacter("robot", renderRobot, "Robot", "0 0 100 100");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof LivelyMascot !== "undefined") {
        LivelyMascot.registerCharacter("robot", renderRobot, "Robot", "0 0 100 100");
      }
    });
  }
})();
