/**
 * lively-mascot · animated mascots（纯浏览器原生 JS，零依赖）
 *
 * 纯浏览器原生 JS，零依赖：任何静态页（含 file://）、Vue / Svelte / Angular 项目、
 * 桌面 WebView / Electron / Tauri 窗口都能直接 <script> 引入即用：
 *
 *   <script src="lively-mascot.js"></script>
 *   <script>
 *     LivelyMascot.createMascot(document.querySelector('#slot'), {
 *       type: 'sprout', color: '#48ff42', size: 120,
 *       onClick: () => console.log('hi'),
 *     });
 *   </script>
 *
 * 也提供 Web Component：<lively-mascot type="sprout"></lively-mascot>（需先 defineMascotElement()）。
 *
 * UMD 嗅探：浏览器挂到 window.LivelyMascot；CommonJS（Node）走 module.exports。
 *
 * @typedef {Object} MascotTheme
 * @property {string} [body]    身体主色
 * @property {string} [outline] 描边 / 眼睛 / 阴影墨色
 * @property {string} [accent]  点缀色（腮红等）
 *
 * @typedef {Object} PupilSpec
 * @property {number} maxX 瞳孔最大横移（SVG 用户坐标）
 * @property {number} maxY 瞳孔最大纵移
 *
 * @typedef {Object} RigApi
 * @property {(el: SVGGElement, spec?: PupilSpec) => void} registerPupil 注册瞳孔动点
 * @property {(el: SVGElement) => void} registerEye                  注册眼睛（眨眼）
 * @property {(el: SVGGElement) => void} registerFace                注册脸（随视线微转）
 *
 * @typedef {(rig: RigApi, host: SVGSVGElement) => void} CharacterRenderer
 *
 * @typedef {Object} MascotCharacter
 * @property {string} id       角色 ID
 * @property {string} name     展示名
 * @property {string} viewBox  SVG viewBox
 * @property {CharacterRenderer} render 渲染器
 *
 * @typedef {Object} CreateMascotOptions
 * @property {string} [type]             角色 ID，默认 'sprout'
 * @property {string} [color]           身体色
 * @property {string} [outline]         墨色
 * @property {string} [accent]          点缀色
 * @property {number} [size]            容器尺寸 px，默认 106
 * @property {boolean} [followCursor]   跟随光标，默认 true
 * @property {[number, number] | null} [hopInterval] 间歇小跳间隔秒，默认 [6,13]，null 关闭
 * @property {() => void} [onClick]     点击回调
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.LivelyMascot = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var DEFAULT_THEME = { body: "#48ff42", outline: "#080808", accent: "#ff9fb6" };
  var DEFAULT_PUPIL_SPEC = { maxX: 8, maxY: 6 };
  var HAPPY_MS = 950;

  var clamp = function (v, min, max) {
    return v < min ? min : v > max ? max : v;
  };

  /** 创建 SVG 元素 + 属性 + 子节点 */
  function svg(tag, attrs, children) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          var v = attrs[k];
          if (v === undefined || v === null) continue;
          el.setAttribute(k, String(v));
        }
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        el.appendChild(children[i]);
      }
    }
    return el;
  }

  /** 创建 HTML 元素（用于根容器 / 身体 / 脚等）；支持 text 作为文本内容 */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          var v = attrs[k];
          if (v === undefined || v === null || v === "") continue;
          if (k === "class") node.className = String(v);
          else if (k === "text") node.textContent = String(v);
          else node.setAttribute(k, String(v));
        }
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) node.appendChild(children[i]);
    }
    return node;
  }

  /* =========================================================
   * 共享动效引擎（rig）。纯 DOM 驱动。
   * ========================================================= */
  function createRig(root, rigEl, config, handlers) {
    config = config || {};
    handlers = handlers || {};
    var followCursor = config.followCursor !== false;
    var gazeRadiusX = config.gazeRadiusX || 200;
    var gazeRadiusY = config.gazeRadiusY || 160;
    var currentHopInterval = config.hopInterval === undefined ? [6, 13] : config.hopInterval;

    var pupils = [];
    var eyes = [];
    var face = null;

    var happy = false;
    var hopping = false;
    var following = followCursor;

    /** 暴露给角色渲染器的注册 API */
    var api = {
      registerPupil: function (elm, spec) {
        var next = spec || DEFAULT_PUPIL_SPEC;
        for (var i = 0; i < pupils.length; i++) {
          if (pupils[i].el === elm) {
            pupils[i].spec = next;
            return;
          }
        }
        pupils.push({ el: elm, spec: next });
      },
      registerEye: function (elm) {
        if (eyes.indexOf(elm) === -1) eyes.push(elm);
      },
      registerFace: function (elm) {
        face = elm;
      },
    };

    function setHappy(v) {
      if (happy === v) return;
      happy = v;
      root.classList.toggle("is-happy", v);
      if (handlers.onHappyChange) handlers.onHappyChange(v);
    }

    function setHopping(v) {
      if (hopping === v) return;
      hopping = v;
      root.classList.toggle("is-hopping", v);
      if (handlers.onHoppingChange) handlers.onHoppingChange(v);
    }

    /* ---- 光标眼神跟随 ---- */
    var raf = 0;
    var rect = root.getBoundingClientRect();
    var rectAt = performance.now();
    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;

    function onPointerMove(e) {
      var now = performance.now();
      if (now - rectAt > 250) {
        rect = root.getBoundingClientRect();
        rectAt = now;
      }
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      targetX = clamp((e.clientX - cx) / gazeRadiusX, -1, 1);
      targetY = clamp((e.clientY - cy) / gazeRadiusY, -1, 1);
    }
    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
    }
    function refreshRect() {
      rect = root.getBoundingClientRect();
      rectAt = performance.now();
    }
    function tick() {
      curX += (targetX - curX) * 0.2;
      curY += (targetY - curY) * 0.2;
      for (var i = 0; i < pupils.length; i++) {
        var p = pupils[i];
        p.el.setAttribute(
          "transform",
          "translate(" + (curX * p.spec.maxX).toFixed(2) + " " + (curY * p.spec.maxY).toFixed(2) + ")",
        );
      }
      if (face) face.setAttribute("transform", "rotate(" + (curX * 3).toFixed(2) + " 50 52)");
      rigEl.style.transform =
        "rotate(" + (curX * 5).toFixed(2) + "deg) translate3d(" +
        (curX * 4).toFixed(1) + "px, " + (curY * 2.5).toFixed(1) + "px, 0)";
      raf = requestAnimationFrame(tick);
    }

    /* ---- 随机眨眼（偶发双眨） ---- */
    var blinkTimer = 0;
    var phaseTimer = 0;
    function scheduleBlink() {
      blinkTimer = window.setTimeout(function () {
        for (var i = 0; i < eyes.length; i++) eyes[i].classList.add("is-blinking");
        phaseTimer = window.setTimeout(function () {
          for (var i = 0; i < eyes.length; i++) eyes[i].classList.remove("is-blinking");
          if (Math.random() < 0.18) {
            phaseTimer = window.setTimeout(function () {
              for (var i = 0; i < eyes.length; i++) eyes[i].classList.add("is-blinking");
              phaseTimer = window.setTimeout(function () {
                for (var i = 0; i < eyes.length; i++) eyes[i].classList.remove("is-blinking");
                scheduleBlink();
              }, 90);
            }, 160);
          } else {
            scheduleBlink();
          }
        }, 110);
      }, 2200 + Math.random() * 2600);
    }

    /* ---- 间歇小跳 ---- */
    var hopTimer = 0;
    var hopResetTimer = 0;
    function scheduleHop() {
      if (!currentHopInterval) return;
      hopTimer = window.setTimeout(function () {
        setHopping(true);
        hopResetTimer = window.setTimeout(function () {
          setHopping(false);
          scheduleHop();
        }, 900);
      }, currentHopInterval[0] * 1000 + Math.random() * (currentHopInterval[1] - currentHopInterval[0]) * 1000);
    }

    /* ---- 点击：开心眯眼 + 果冻弹跳 + 踢腿 ---- */
    function fireClick() {
      if (handlers.onClick) handlers.onClick();
      setHappy(true);
      window.setTimeout(function () {
        setHappy(false);
      }, HAPPY_MS);
    }

    /* ---- 启动 ---- */
    if (following) {
      raf = requestAnimationFrame(tick);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("resize", refreshRect, { passive: true });
      window.addEventListener("scroll", refreshRect, { passive: true });
    }
    scheduleBlink();
    scheduleHop();

    root.addEventListener("pointerdown", fireClick);

    return {
      api: api,
      click: fireClick,
      setFollowCursor: function (enabled) {
        if (enabled && !following) {
          following = true;
          raf = requestAnimationFrame(tick);
          window.addEventListener("pointermove", onPointerMove, { passive: true });
          document.addEventListener("pointerleave", onPointerLeave);
          window.addEventListener("resize", refreshRect, { passive: true });
          window.addEventListener("scroll", refreshRect, { passive: true });
        } else if (!enabled && following) {
          following = false;
          cancelAnimationFrame(raf);
          window.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("resize", refreshRect);
          window.removeEventListener("scroll", refreshRect);
        }
      },
      setHopInterval: function (interval) {
        currentHopInterval = interval;
      },
      destroy: function () {
        cancelAnimationFrame(raf);
        window.clearTimeout(blinkTimer);
        window.clearTimeout(phaseTimer);
        window.clearTimeout(hopTimer);
        window.clearTimeout(hopResetTimer);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("resize", refreshRect);
        window.removeEventListener("scroll", refreshRect);
        root.removeEventListener("pointerdown", fireClick);
      },
    };
  }

  /* =========================================================
   * 角色：嫩芽团子（sprout）
   * 结构与原项目自测页吉物同构：圆角身体(DIV) + 独立嫩芽(span+svg)
   * + 叠层脸(div+svg) + ◡ 脚，统一「实色填充 + 2px 墨描边 + 硬阴影」贴纸风。
   * ========================================================= */
  function renderSprout(rig, rigEl) {
    var clipId = "lively-eye-clip-" + Math.random().toString(36).slice(2, 9);

    /* 嫩芽：独立 svg，茎根会被后面不透明身体盖住，像从头顶长出来 */
    var leaf = el("span", { class: "lively__leaf", "aria-hidden": "true" });
    leaf.appendChild(
      svg("svg", { viewBox: "0 0 52 56" }, [
        svg("path", { class: "lively-sprout__stem", d: "M26 52 C26 42, 26 34, 26 27" }),
        svg("path", { class: "lively-sprout__leaf", d: "M26 28 C22 15, 14 9, 6 12 C5 20, 12 29, 26 28 Z" }),
        svg("path", { class: "lively-sprout__vein", d: "M23 26 C18 21, 12 16, 8 14" }),
        svg("path", { class: "lively-sprout__shine", d: "M22 26 C16 16, 11 12, 7 14" }),
        svg("path", { class: "lively-sprout__leaf", d: "M26 28 C30 15, 38 9, 46 12 C47 20, 40 29, 26 28 Z" }),
        svg("path", { class: "lively-sprout__vein", d: "M29 26 C34 21, 40 16, 44 14" }),
        svg("path", { class: "lively-sprout__shine", d: "M30 26 C36 16, 41 12, 45 14" }),
      ]),
    );

    /* 身体：圆角贴纸块，墨描边 + 硬偏移阴影（JS 施加待机摇摆） */
    var body = el("div", { class: "lively-body" });

    /* 脸：叠在身体上的 SVG 贴纸层，随视线微转（JS 注入 transform） */
    var face = svg("g", { class: "lively-face" });
    rig.registerFace(face);
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 20, cy: 57, rx: 7, ry: 4 }));
    face.appendChild(svg("ellipse", { class: "lively-face__blush", cx: 80, cy: 57, rx: 7, ry: 4 }));

    function buildEye(cx, cy, registerEye, registerPupil) {
      var wrapper = svg("g", { transform: "translate(" + cx + " " + cy + ")" });
      var eye = svg("g", { class: "lively-face__eye" });
      registerEye(eye);
      eye.appendChild(svg("ellipse", { rx: 10, ry: 11.5 }));
      var clip = svg("g", { "clip-path": "url(#" + clipId + ")" });
      var pupil = svg("g");
      registerPupil(pupil, { maxX: 8, maxY: 6 });
      pupil.appendChild(svg("circle", { class: "lively-face__pupil", r: 6.2 }));
      pupil.appendChild(svg("circle", { class: "lively-face__shine", cx: 2.2, cy: -2.4, r: 2.1 }));
      clip.appendChild(pupil);
      eye.appendChild(clip);
      eye.appendChild(svg("path", { class: "lively-face__happy", d: "M-6.5 1.5 Q0 -6 6.5 1.5" }));
      wrapper.appendChild(eye);
      return wrapper;
    }

    face.appendChild(buildEye(34, 43, rig.registerEye, rig.registerPupil));
    face.appendChild(buildEye(66, 43, rig.registerEye, rig.registerPupil));
    face.appendChild(svg("path", { class: "lively-face__mouth", d: "M42 63 Q50 70 58 63" }));
    face.appendChild(svg("path", { class: "lively-face__happy-mouth", d: "M40 61 Q50 74 60 61 Q50 66 40 61 Z" }));

    var faceSvg = svg("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" });
    var defs = svg("defs");
    var clipPath = svg("clipPath", { id: clipId });
    clipPath.appendChild(svg("ellipse", { rx: 10, ry: 11.5 }));
    defs.appendChild(clipPath);
    faceSvg.appendChild(defs);
    faceSvg.appendChild(face);
    var faceWrap = el("div", { class: "lively-face-wrap" });
    faceWrap.appendChild(faceSvg);

    /* 绘制顺序：嫩芽(最前) → 身体 → 脸(最顶)，与 rig 容器；脚单独挂在 rig 外 */
    rigEl.appendChild(leaf);
    rigEl.appendChild(body);
    rigEl.appendChild(faceWrap);
  }

  /* =========================================================
   * 角色注册表
   * ========================================================= */
  var characters = {
    sprout: { id: "sprout", name: "Sprout", viewBox: "0 0 100 100", render: renderSprout },
  };

  /**
   * 注册一个新角色。
   * @param {string} id 角色 ID
   * @param {CharacterRenderer} render 渲染器
   * @param {string} [name] 展示名
   * @param {string} [viewBox] SVG viewBox
   */
  function registerCharacter(id, render, name, viewBox) {
    characters[id] = { id: id, name: name || id, viewBox: viewBox || "0 0 100 100", render: render };
  }

  function getCharacter(type) {
    return characters[type] || characters.sprout;
  }

  /* =========================================================
   * 主 API：createMascot(target, options)
   * ========================================================= */
  /**
   * 在某个 DOM 容器内创建一个动画吉祥物。
   * @param {HTMLElement} target 容器元素
   * @param {CreateMascotOptions} [options] 配置
   * @returns {Object} 实例 { el, type, setTheme, setFollowCursor, setHopInterval, click, destroy }
   */
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

    /* 主题色以 CSS 变量注入（缺省不写，回退 CSS 默认值） */
    var theme = { body: options.color || "", outline: options.outline || "", accent: options.accent || "" };
    function applyTheme() {
      root.style.setProperty("--lively-body", theme.body || null);
      root.style.setProperty("--lively-outline", theme.outline || null);
      root.style.setProperty("--lively-accent", theme.accent || null);
    }
    applyTheme();

    var rig = createRig(root, rigEl, { followCursor: options.followCursor, hopInterval: options.hopInterval }, { onClick: options.onClick });
    character.render(rig.api, rigEl);

    root.appendChild(rigEl);

    /* 脚：实心墨色小脚（SVG，与身体同贴纸语言），原地交替踏步（挂在 rig 外，跳动时收起） */
    function buildFoot(side) {
      var foot = el("span", { class: "lively__foot lively__foot--" + side, "aria-hidden": "true" });
      foot.appendChild(
        svg("svg", { viewBox: "0 0 24 18" }, [
          svg("ellipse", { class: "lively-foot__body", cx: 12, cy: 11, rx: 10, ry: 7 }),
          svg("ellipse", { class: "lively-foot__shine", cx: 8.5, cy: 8.5, rx: 3.2, ry: 2 }),
        ]),
      );
      return foot;
    }
    var feet = el("div", { class: "lively__feet", "aria-hidden": "true" });
    feet.appendChild(buildFoot("l"));
    feet.appendChild(buildFoot("r"));
    rigEl.appendChild(feet);

    target.appendChild(root);

    return {
      el: root,
      type: character.id,
      setTheme: function (partial) {
        if (partial.body !== undefined) theme.body = partial.body;
        if (partial.outline !== undefined) theme.outline = partial.outline;
        if (partial.accent !== undefined) theme.accent = partial.accent;
        applyTheme();
      },
      setFollowCursor: function (enabled) {
        rig.setFollowCursor(enabled);
      },
      setHopInterval: function (interval) {
        rig.setHopInterval(interval);
      },
      click: function () {
        rig.click();
      },
      destroy: function () {
        rig.destroy();
        root.remove();
      },
    };
  }

  /* =========================================================
   * Web Component 适配层（可选）
   * ========================================================= */
  function defineMascotElement(tag) {
    tag = tag || "lively-mascot";
    if (typeof customElements === "undefined" || customElements.get(tag)) return;

    var LivelyMascotElement = function () {};
    LivelyMascotElement.prototype = Object.create(HTMLElement.prototype);

    LivelyMascotElement.prototype.connectedCallback = function () {
      this._render();
    };
    LivelyMascotElement.prototype.disconnectedCallback = function () {
      if (this._inst) this._inst.destroy();
      this._inst = null;
      this.textContent = "";
    };
    LivelyMascotElement.prototype.attributeChangedCallback = function () {
      if (this.isConnected) this._render();
    };
    LivelyMascotElement.prototype._render = function () {
      if (this._inst) this._inst.destroy();
      this.textContent = "";
      var hopAttr = this.getAttribute("hop-interval");
      var hopInterval = hopAttr ? hopAttr.split(",").map(Number) : null;
      this._inst = createMascot(this, {
        type: this.getAttribute("type") || undefined,
        color: this.getAttribute("color") || undefined,
        outline: this.getAttribute("outline") || undefined,
        accent: this.getAttribute("accent") || undefined,
        size: this.getAttribute("size") ? Number(this.getAttribute("size")) : undefined,
        followCursor: this.getAttribute("follow-cursor") !== "false",
        hopInterval: hopInterval,
        onClick:
          this.onMascotClick ||
          function () {
            this.dispatchEvent(new CustomEvent("mascot-click"));
          }.bind(this),
      });
    };
    LivelyMascotElement.observedAttributes = ["type", "color", "outline", "accent", "size", "follow-cursor", "hop-interval"];

    customElements.define(tag, LivelyMascotElement);
  }

  /* =========================================================
   * 导出
   * ========================================================= */
  return {
    createMascot: createMascot,
    registerCharacter: registerCharacter,
    defineMascotElement: defineMascotElement,
    characters: characters,
    version: "0.1.0",
  };
});
