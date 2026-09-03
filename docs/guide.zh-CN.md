# Lively Mascot 指南

[English](guide.md) · [README](../README.zh-CN.md)

## 接入

### React 和 Vue

当应用状态需要驱动表情时，使用命令式 API：

```jsx
import { useEffect, useRef } from "react";
import { createMascot } from "lively-mascot";
import "lively-mascot/dist/lively-mascot.min.css";

export function Mascot({ type = "sprout", size = 180 }) {
  const host = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    instance.current = createMascot(host.current, { type, size });
    return () => instance.current && instance.current.destroy();
  }, [type, size]);

  return <div ref={host} />;
}
```

Vue 中在 `onMounted` 创建实例、`onBeforeUnmount` 销毁实例，并在 `type` 或 `size` 变化时重建即可。

### Web Component

只需要声明式待机角色时，全局注册一次元素：

```html
<script>
  LivelyMascot.defineMascotElement();
</script>

<lively-mascot type="cat" color="#ffd66b" size="180" view-mode="3d"></lively-mascot>
<lively-mascot type="ghost" color="#9be7ff" size="160"></lively-mascot>
```

元素会响应 `type`、`color`、`size`、`view-mode`（或 `mode`）和 `show-outline` 的变化并重建。它不暴露实例；需要调用 `setEmotion` 等方法时，请使用 `createMascot`。

### 浏览器和源码加载

浏览器直接使用时，加载自包含的发行文件：

```html
<link rel="stylesheet" href="dist/lively-mascot.min.css" />
<script src="dist/lively-mascot.min.js"></script>
```

自行托管源码时，依次加载 `src/core/emotions.js`、`src/core/dom.js`、`src/core/rig.js` 和 `src/lively-mascot.js`，然后按需加载各模型对应的 CSS 与 JavaScript 文件。

## API 参考

### `createMascot(target, options)`

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"sprout"` | 角色 ID |
| `color`、`outline`、`accent` | `string` | - | 主题色 |
| `size` | `number` | `106` | 正方形边长，单位 px |
| `followCursor` | `boolean` | `true` | 是否开启视线跟随 |
| `viewMode` / `mode` | `"2d" \| "3d"` | `"3d"` | 展示模式 |
| `outlineVisible` | `boolean` | `true` | 是否显示外轮廓线 |
| `animated` | `boolean` | `true` | 是否启用动画 |
| `hopInterval` | `[number, number] \| null` | `[6, 13]` | 随机跳跃间隔，单位秒 |
| `onClick` | `() => void` | - | 点击回调 |

返回实例提供：

```js
instance.el;
instance.type;
instance.viewMode;
instance.outlineVisible;
instance.setViewMode("2d");
instance.setOutlineVisible(false);
instance.setFaceVariant("default"); // "default" | "simple" | "dot"
instance.setTheme({ body: "#67d9ff", outline: "#17202a", accent: "#ffd6a5" });
instance.setEmotion("10");
instance.clearEmotion();
instance.destroy();
```

### 表情注册表

通过 `LivelyMascot.emotions` 和 `LivelyMascot.emotionGroups` 获取当前可用的 ID、名称、分组和配方。界面或业务代码应以它们为准，这样新增表情后无需同步维护固定范围或清单。

## 自定义模型

标准部件、动作语义和换皮固定色规则见 [模型动作目录](model-actions.zh-CN.md)。

### 统一模型定义

新增模型只使用 `defineModel()`。一份定义同时声明渲染、可动部件、可换皮槽位和特效锚点；不再支持运行时 SVG/HTML 字符串导入或 DOM 标记扫描：

```js
var actions = LivelyMascot.partActions;

LivelyMascot.defineModel({
  id: "my-model",
  name: "My Model",
  presentation: {
    icon: "M",
    labels: { zh: "我的模型", en: "My Model" },
    greeting: { zh: "你好！", en: "Hello!" },
    order: 100,
    theme: { body: "#67d9ff", outline: "#17202a", accent: "#ffd6a5" }
  },
  parts: {
    body: { actions: actions.body },
    eyes: { actions: actions.eyes },
    mouth: { actions: actions.mouth },
    top: { actions: actions.top }
  },
  skin: { slots: ["body", "outline", "accent"], fixed: { pupil: "#18222a", "identity-mark": "#f4e7d0" } },
  effects: {
    supported: ["hearts", "sparkles", "sleep", "loading"],
    anchors: { head: { x: 50, y: 12 }, body: { x: 50, y: 58 } }
  },
  render: function (model, container) {
    var body = document.createElement("div");
    body.className = "lively-body lively-body--my-model";
    model.registerPart("body", body);
    var face = LivelyMascot.buildFaceSvg(model);
    body.appendChild(face.wrap);
    container.appendChild(body);
  }
});
```

`setEmotion()` 先读取统一的情绪配方，再将眼睛、嘴、身体等动作只分派给模型实际声明的部件；没有的部件会自动跳过。`getCapabilities()` 可读取当前模型的部件、皮肤槽位和特效能力。`setTheme()` 只能修改 `skin.slots`，而 `skin.fixed` 会写入 `--lively-fixed-<名称>` CSS 变量并保持不变；可通过 `getSkin()` 读取两者。

`presentation` 为可选字段；填入后，仓库演示页会自动使用其中的本地化名称、问候语、排序、图标和默认配色，无需再维护演示页侧的映射表。

帽子、眼镜等可切换物件使用模型的 `accessories` 声明，并由实例的 `setAccessory(id, enabled)` 单独控制；完整规则见[模型动作目录](model-actions.zh-CN.md#可切换配件)。

### 图片模型 Skill

仓库内置 `skills/lively-mascot-image-model/`。安装到 Codex skills 目录后，附上参考图并调用：

```bash
cp -R skills/lively-mascot-image-model "${CODEX_HOME:-$HOME/.codex}/skills/"
```

```text
$lively-mascot-image-model
请把这张图生成 lively-mascot 角色，名称为“小狐狸”。
```

Skill 会优先选择相近的原生 archetype，保留项目既有的面部、2D/3D 层和局部部件运动，结果写入 `outputs/lively-mascot-model/<slug>/`。它直接使用提供的参考图，不需要 API key 或中间生成图片。

完整规范见 [Skill 指令](../skills/lively-mascot-image-model/SKILL.md)。

## 扩展引擎

通过模型定义注册角色，并将可动层交给运行时：

```js
function renderMyCharacter(model, gazeEl) {
  var body = document.createElement("div");
  body.className = "lively-body lively-body--my-character";
  model.registerPart("body", body);

  var face = LivelyMascot.buildFaceSvg(model);
  body.appendChild(face.wrap);
  gazeEl.appendChild(body);
}

LivelyMascot.defineModel({ id: "my-character", render: renderMyCharacter, parts: { body: { actions: LivelyMascot.partActions.body } } });
```

可选层使用 `model.registerPart("top", element)`、`model.registerPart("feet", element)` 或 `model.registerPart("tail", element)`。添加自定义情绪：

```js
LivelyMascot.emotions["50"] = {
  id: "50",
  name: "Custom",
  group: "custom",
  desc: "自定义",
  bodyAnim: "my-custom-animation 1s ease-in-out",
  recipe: {
    parts: { body: "bounce", eyes: "happy", mouth: "smile" },
    effects: [{ type: "sparkles", anchor: "head" }]
  }
};
```

## 从源码构建

```bash
npm install
npm run build
```

构建会重新生成 `dist/lively-mascot.min.js` 和 `dist/lively-mascot.min.css`。修改 `src/` 后运行一次即可。
