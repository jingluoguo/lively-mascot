# ✦ lively-mascot

[English](README.md) · **简体中文**

> 动画吉祥物，适用于聊天机器人、桌面宠物与网页小部件——它们会眨眼、呼吸、跟随你的光标，还会表达情绪。

把一只吉祥物放进任何页面，它就会活过来：眨眼、呼吸、摇摆、跺脚、没人注意时还会蹦跶一下——眼睛始终追着你的光标。点它一下，它会开心起来。**无需构建、无需 npm install。**一个 `<script>` 标签搞定。

## 特性

- **零依赖、免构建** —— 单个 `lively-mascot.js`。`file://`、CDN 或任何打包器都直接可用。
- **随处可用** —— 纯 JS 核心 + 可选的 `<lively-mascot>` 自定义元素。可直接用于原生 HTML、Vue、Svelte、Angular、WordPress、Electron 或 Tauri。
- **开箱即活** —— 呼吸、眨眼、摇摆、跺脚、嫩芽晃动、随机小跳，以及点击开心的反馈。全部动画由 CSS keyframes + 极简 rAF 引擎驱动。
- **感知光标** —— 眼睛（以及整个身体）会平滑追踪指针。
- **可换主题** —— `color` / `outline` / `accent` 换色；样式基于 CSS 变量。
- **一行换角色** —— 当前有 `type: "sprout"`，更多角色在路上。

## 用法

### 方式 A — script 标签（任意静态页）

把 `src/lively-mascot.js` 和 `src/lively-mascot.css` 放到 HTML 同目录，然后：

```html
<link rel="stylesheet" href="lively-mascot.css" />
<div id="slot"></div>
<script src="lively-mascot.js"></script>
<script>
  LivelyMascot.createMascot(document.querySelector("#slot"), {
    type: "sprout",
    color: "#48ff42",
    size: 120,
    onClick: () => console.log("hi!"),
  });
</script>
```

直接用浏览器打开文件即可，不需要起服务器。

### 方式 B — Web Component（无需写 JS 接线）

```html
<script src="lively-mascot.js"></script>
<script>
  LivelyMascot.defineMascotElement("lively-mascot");
</script>

<!-- 之后在任意位置： -->
<lively-mascot type="sprout" color="#6ec7ff" size="96"></lively-mascot>
```

`<lively-mascot>` 支持属性：`type`、`color`、`outline`、`accent`、`size`、`follow-cursor`（`"false"` 关闭）、`hop-interval`（`"6,13"` 秒，或 `""` 关闭）。点击时派发 `mascot-click` 事件，或在 JS 里设置 `el.onMascotClick = ...`。

### 方式 C — 通过 CDN

```html
<link rel="stylesheet" href="https://unpkg.com/lively-mascot@0.1.0/src/lively-mascot.css" />
<script src="https://unpkg.com/lively-mascot@0.1.0/src/lively-mascot.js"></script>
```

## API

### `createMascot(target, options)`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"sprout"` | 角色 ID。 |
| `color` | `string` | `#48ff42` | 身体颜色（CSS 变量 `--lively-body`）。 |
| `outline` | `string` | `#080808` | 描边 / 眼睛 / 阴影墨色（CSS 变量 `--lively-outline`）。 |
| `accent` | `string` | `#ff9fb6` | 强调色，如腮红（CSS 变量 `--lively-accent`）。 |
| `size` | `number` | `106` | 容器尺寸（px）。 |
| `followCursor` | `boolean` | `true` | 眼睛 / 身体是否跟随指针。 |
| `hopInterval` | `[number, number] \| null` | `[6, 13]` | 随机小跳间隔（秒）；`null` 禁用。 |
| `onClick` | `() => void` | — | 点击回调（同时播放开心动画）。 |

**返回值**：`{ el, type, setTheme(partial), setFollowCursor(bool), setHopInterval(interval), click(), destroy() }`。

```js
const m = LivelyMascot.createMascot(document.body, { type: "sprout", size: 140 });
m.setTheme({ color: "#ff9fb6" }); // 运行时换色
m.setFollowCursor(false);         // 停止跟随光标
m.click();                         // 触发开心反馈
m.destroy();                       // 从 DOM 移除并释放监听 / 定时器
```

### `registerCharacter(id, render, name?, viewBox?)`

不动核心即可新增角色。`render(rig, hostSvg)` 负责把 SVG 画进宿主，并通过 `rig.registerPupil / registerEye / registerFace` 标记动点。

```js
function renderCat(rig, host) {
  // ...把 <svg class="lively-character"> 画进 host...
  rig.registerEye(eyeEl);
  rig.registerPupil(pupilEl, { maxX: 7, maxY: 5 });
}
LivelyMascot.registerCharacter("cat", renderCat, "Cat");
// 然后：createMascot(el, { type: "cat" })
```

### `defineMascotElement(tag?)`

注册 `<lively-mascot>` 自定义元素（默认标签 `lively-mascot`）。可重复调用。

## 自定义角色

角色是一个渲染器：把吉祥物的 DOM 构建进 `rigEl`，并通过 `rig` API 注册动点：

- **身体** `<div class="lively-body">` —— 圆角贴纸块（描边 + 偏移阴影），自动获得摇摆 + 果冻弹跳。
- **嫩芽** 任意带 `lively__leaf` 类的元素；用 CSS 设置待机摇曳，`.is-happy` 时转一圈。
- **眼睛** `<g class="lively-face__eye">` —— 用 `rig.registerEye` 注册 → 自动眨眼。
- **瞳孔** 每只眼睛内的 `<g>`，用 `clipPath` 裁剪溢出 —— 用 `rig.registerPupil(el, { maxX, maxY })` 注册 → 自动视线跟随。
- **脸** `<g class="lively-face">` —— 用 `rig.registerFace` 注册 → 随视线轻微歪头（可选，通常用 `.lively-face-wrap` 叠在身体上）。
- **脚** `<div class="lively__feet">` 内两个 `◡` 字符 —— 用 `.lively__foot--l/--r` 设置踏步 / 踢腿 / 收起。

主题色必须通过 CSS 变量 `--lively-body`、`--lively-outline`、`--lively-accent` 引用——绝不要硬编码。完整示例见 `src/lively-mascot.js` → `renderSprout`。

## 演示

直接用浏览器打开 `index.html`（无需服务器），即可同时看到函数式 API 与 Web Component 的演示。

## 路线图

- [ ] 更多内置角色（cat、star、blob……）
- [ ] `mood` 状态 —— `happy` / `thinking` / `sleepy`
- [ ] 悬浮助手包装（`position: fixed` 外层）

## 许可证

MIT
