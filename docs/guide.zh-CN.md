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

### 源码模块化加载

自行托管源码时，先加载核心，再加载角色：

```html
<link rel="stylesheet" href="src/lively-mascot.css" />
<link rel="stylesheet" href="src/characters/sprout.css" />
<link rel="stylesheet" href="src/characters/cat.css" />
<link rel="stylesheet" href="src/characters/robot.css" />
<link rel="stylesheet" href="src/characters/ghost.css" />
<link rel="stylesheet" href="src/characters/jelly.css" />

<script src="src/core/emotions.js"></script>
<script src="src/core/rig.js"></script>
<script src="src/lively-mascot.js"></script>
<script src="src/characters/sprout.js"></script>
<script src="src/characters/cat.js"></script>
<script src="src/characters/robot.js"></script>
<script src="src/characters/ghost.js"></script>
<script src="src/characters/jelly.js"></script>
```

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

### 表情 ID

| 分组 | ID | 状态 |
| --- | --- | --- |
| 生命周期 | `00-09` | Sleep、Wake、Idle、Breathe、Ready、Pause、Refresh、LowBattery、Offline、Boot |
| 情绪反应 | `10-19` | Happy、Curious、Aggrieved、Angry、Surprised、Shy、Love、Confused、Cool、Smug |
| 工作状态 | `20-31` | Thinking、Listening、Talking、Searching、Reading、Writing、Coding、Designing、Loading、Processing、Success、Error |
| 扩展状态 | `32-39` | Grateful、Retrying、Cancelled、Crying、Bored、Nervous、Eureka、Waiting |

## 自定义模型

### 运行时 SVG 和 HTML

`registerModel()` 接受 SVG 或 HTML 字符串，在注册时清理危险内容，并为每个实例克隆一份 DOM：

```js
const markup = await file.text();
LivelyMascot.registerModel("user-model", markup, { name: file.name });

LivelyMascot.createMascot(container, {
  type: "user-model",
  size: 160,
  viewMode: "2d"
});
```

使用 `data-lively-body`、`data-lively-leaf`、`data-lively-feet`、`data-lively-eye`、`data-lively-pupil` 和 `data-lively-face` 标记需要接入 rig 的部件。给瞳孔添加 `data-max-x` / `data-max-y` 可调整视线范围。用户模型可通过 `.lively-mascot.is-emotion-10` 等状态选择器添加表情样式。

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

通过 renderer 注册角色，并将可动层交给 rig：

```js
function renderMyCharacter(rig, gazeEl) {
  var body = document.createElement("div");
  body.className = "lively-body lively-body--my-character";
  rig.registerBody(body);

  var face = LivelyMascot.buildFaceSvg(rig);
  body.appendChild(face.wrap);
  gazeEl.appendChild(body);
}

LivelyMascot.registerCharacter("my-character", renderMyCharacter, "My Character");
```

可选层使用 `rig.registerLeaf(element, options)`、`rig.registerFeet(element)` 和 `rig.registerFaceAccessory(name, element)`。添加自定义表情：

```js
LivelyMascot.emotions["50"] = {
  id: "50",
  name: "Custom",
  group: "custom",
  desc: "自定义",
  bodyAnim: "my-custom-animation 1s ease-in-out"
};
```

## 从源码构建

```bash
npm install
npm run build
```

构建会重新生成 `dist/lively-mascot.min.js` 和 `dist/lively-mascot.min.css`。修改 `src/` 后运行一次即可。
