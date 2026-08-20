/**
 * lively-mascot · core SDK (v0.7.0)
 *
 * Requires: src/core/emotions.js, src/core/rig.js (loaded before this script)
 * Character files (src/characters/*.js) register themselves after this script.
 *
 * @license MIT
 */
(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var emo = require("./core/emotions.js");
    module.exports = factory(emo.groups, emo.emotions);
  } else {
    root.LivelyMascot = factory(
      root.LivelyEmotionGroups || {},
      root.LivelyEmotions || {}
    );
  }
})(typeof self !== "undefined" ? self : this, function (LivelyEmotionGroups, LivelyEmotions) {
  "use strict";

  // --- DOM Helpers ---
  function el(tag, attrs, children) {
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

  // --- Character Registry ---
  // Characters register themselves via LivelyMascot.registerCharacter() from
  // their own script files (e.g. src/characters/sprout.js, src/characters/cat.js).
  var characters = {};

  function registerCharacter(id, render, name, viewBox) {
    characters[id] = { id: id, name: name || id, viewBox: viewBox || "0 0 100 100", render: render };
  }
  function getCharacter(type) { return characters[type] || characters.sprout; }

  // --- Core API ---
  function createMascot(target, options) {
    options = options || {};
    var type = options.type || "sprout";
    var character = getCharacter(type);
    var root = el("div", {
      class: "lively-mascot lively-mascot--" + character.id,
      style: "width:" + (options.size || 106) + "px;height:" + (options.size || 106) + "px",
      "aria-hidden": "true",
    });
    var rigEl = el("div", { class: "lively-mascot__rig" });
    // gaze wrapper holds all character parts so the whole face turns with the
    // body posture (sway / lean) instead of staying dead-on.
    var gazeEl = el("div", { class: "lively-mascot__gaze" });
    rigEl.appendChild(gazeEl);
    var theme = { body: options.color || "", outline: options.outline || "", accent: options.accent || "" };
    function applyTheme() {
      root.style.setProperty("--lively-body", theme.body || null);
      root.style.setProperty("--lively-outline", theme.outline || null);
      root.style.setProperty("--lively-accent", theme.accent || null);
    }
    applyTheme();
    var rig = createRig(root, rigEl, { followCursor: options.followCursor, hopInterval: options.hopInterval }, { onClick: options.onClick });
    character.render(rig.api, gazeEl);
    rig.api.registerGazeWrap(gazeEl);
    root.appendChild(rigEl);
    target.appendChild(root);

    return {
      el: root,
      type: character.id,
      setTheme: function (p) { if(p.body)theme.body=p.body; if(p.outline)theme.outline=p.outline; applyTheme(); },
      setEmotion: function (emotionId) {
        root.className = root.className.replace(/is-emotion-\d+/g, "").trim();
        root.classList.add("is-emotion-" + emotionId);
        rig.api.setEmotionState(String(emotionId));
      },
      clearEmotion: function () {
        root.className = root.className.replace(/is-emotion-\d+/g, "").trim();
        root.classList.add("is-emotion-02");
        rig.api.setEmotionState("02");
      },
      destroy: function () { rig.destroy(); root.remove(); }
    };
  }

  function defineMascotElement(tag) {
    tag = tag || "lively-mascot";
    if (typeof customElements === "undefined" || customElements.get(tag)) return;
    var _create = createMascot;
    var LivelyMascotElement = (function () {
      function LivelyMascotElement() {
        var _newTarget = this.constructor;
        var _this = Reflect.construct(HTMLElement, [], _newTarget);
        return _this;
      }
      LivelyMascotElement.prototype = Object.create(HTMLElement.prototype, {
        constructor: { value: LivelyMascotElement, writable: true, configurable: true }
      });
      LivelyMascotElement.observedAttributes = ["type", "color", "size"];
      LivelyMascotElement.prototype.connectedCallback = function () { this._render(); };
      LivelyMascotElement.prototype.disconnectedCallback = function () { if (this._inst) this._inst.destroy(); this._inst = null; this.textContent = ""; };
      LivelyMascotElement.prototype.attributeChangedCallback = function () { if (this.isConnected) this._render(); };
      LivelyMascotElement.prototype._render = function () {
        if (this._inst) this._inst.destroy();
        this.textContent = "";
        this._inst = _create(this, {
          type: this.getAttribute("type"),
          color: this.getAttribute("color"),
          size: this.getAttribute("size") ? Number(this.getAttribute("size")) : undefined
        });
      };
      return LivelyMascotElement;
    })();
    customElements.define(tag, LivelyMascotElement);
  }

  return {
    createMascot: createMascot,
    registerCharacter: registerCharacter,
    defineMascotElement: defineMascotElement,
    characters: characters,
    emotions: LivelyEmotions,
    emotionGroups: LivelyEmotionGroups,
    version: "0.7.0"
  };
});
