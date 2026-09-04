/**
 * lively-mascot - Small DOM factory helpers shared by the core and models.
 *
 * The module is dependency-free so it can be loaded directly in a browser or
 * required from CommonJS.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    var api = factory();
    module.exports = api;
    if (typeof globalThis !== "undefined") globalThis.LivelyDom = api;
  } else root.LivelyDom = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function create(tag, attrs, children, namespace) {
    var node = namespace
      ? document.createElementNS(namespace, tag)
      : document.createElement(tag);
    if (attrs) for (var key in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
      var value = attrs[key];
      if (value === undefined || value === null || value === "") continue;
      if (!namespace && key === "class") node.className = String(value);
      else if (!namespace && key === "text") node.textContent = String(value);
      else node.setAttribute(key, String(value));
    }
    if (children) for (var i = 0; i < children.length; i++) node.appendChild(children[i]);
    return node;
  }

  return {
    hEl: function (tag, attrs, children) { return create(tag, attrs, children); },
    svg: function (tag, attrs, children) { return create(tag, attrs, children, SVG_NS); }
  };
});
