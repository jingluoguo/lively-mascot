# ✦ lively-mascot

[English](README.md) · **简体中文**

> 电子宠物引擎：40 种状态表情 · 纯 SVG 驱动 · 零依赖 · 纯数据配置 · 即插即用。

一套为聊天机器人、桌面宠物、网页插件及 AI 助手打造的表情系统。通过 `setEmotion(id)` 即可切换对应表情，每个表情自带独立的身体、叶子、脚部动画和面部表情。

**[在线预览](https://jingluoguo.github.io/lively-mascot/)**

## 特性

- **40 种状态表情**：覆盖生命周期（睡眠/待机）、情绪反应（开心/生气）、工作状态（思考/搜索）与扩展状态（无聊/紧张/灵光一现/等待）。
- **全要素联动**：每个表情控制眼睛、嘴巴、腮红、身体、叶子、脚部 6 大部位的独立动画。
- **配置驱动**：每个表情都是纯数据组合（动画 + 滤镜 + 行为参数），支持运行时注册新表情。
- **零依赖、零构建**：原生 JS，无框架依赖，一个 `<script>` 标签即可引入。
- **即插即用**：支持 Web Component `<lively-mascot>` 和函数式 API `createMascot`。
- **视线跟随**：眼睛平滑跟随指针；表情激活时自动暂停跟随，结束后平滑恢复。
- **主题化**：支持多实例主题切换（`setTheme`），所有样式基于 CSS 变量。

## 快速开始

```html
<link rel="stylesheet" href="src/lively-mascot.css" />
<div id="slot"></div>
<script src="src/core/emotions.js"></script>
<script src="src/lively-mascot.js"></script>
<script>
  var m = LivelyMascot.createMascot(document.getElementById('slot'), {
    type: 'sprout', size: 180
  });

  // 切换表情
  m.setEmotion('10'); // 开心
  m.setEmotion('20'); // 思考中
  m.clearEmotion();   // 恢复待机
</script>
```

## API

### `createMascot(target, options)`

| 选项           | 类型      | 默认值     | 描述             |
| -------------- | --------- | ---------- | ---------------- |
| `type`         | `string`  | `"sprout"` | 角色 ID          |
| `color`        | `string`  | —          | 身体颜色         |
| `outline`      | `string`  | —          | 描边/眼睛颜色    |
| `accent`       | `string`  | —          | 点缀色（腮红等） |
| `size`         | `number`  | `106`      | 容器尺寸 px      |
| `followCursor` | `boolean` | `true`     | 是否跟随光标     |

**返回实例**：`{ el, type, setTheme, setEmotion(id), clearEmotion(), destroy() }`

### 表情行为

每个表情可配置以下行为：

| 字段         | 说明                                |
| ------------ | ----------------------------------- |
| `bodyAnim`   | 身体 CSS 动画                       |
| `bodyFilter` | 身体滤镜（如变暗、变灰）            |
| `leafAnim`   | 叶子 CSS 动画                       |
| `footAnim`   | 脚部 CSS 动画                       |
| `blink`      | `false` 禁用眨眼，`"fast"` 快速眨眼 |
| `gaze`       | `false` 暂停视线跟随                |

### 表情 ID 映射

| 分组         | ID    | 表情                                                                                                                         |
| :----------- | :---- | :--------------------------------------------------------------------------------------------------------------------------- |
| **生命周期** | 00-09 | Sleep · Wake · Idle · Breathe · Ready · Pause · Refresh · LowBattery · Offline · Boot                                        |
| **情绪反应** | 10-19 | Happy · Excited · Sad · Angry · Surprised · Shy · Love · Confused · Cool · Smug                                              |
| **工作状态** | 20-31 | Thinking · Listening · Talking · Searching · Reading · Writing · Coding · Designing · Loading · Processing · Success · Error |
| **扩展状态** | 32-39 | Grateful · Retrying · Cancelled · Crying · Bored · Nervous · Eureka · Waiting                                                |

## 扩展指南

### 注册新角色

```js
function renderMyChar(rig, rigEl) {
  // 绘制 SVG 并注册动点
  rig.registerEye(eyeEl);
  rig.registerPupil(pupilEl, { maxX: 8, maxY: 6 });
  rig.registerLeaf(leafEl);
  rig.registerFeet(feetEl);
}
LivelyMascot.registerCharacter('myChar', renderMyChar, 'My Char');
```

### 注册新表情

```js
LivelyMascot.emotions['50'] = {
  id: '50', name: 'Custom', group: 'custom', desc: '自定义',
  bodyAnim: 'my-custom-anim 1s ease-in-out',
  leafAnim: 'my-leaf-anim 1s ease-in-out',
  footAnim: 'my-foot-anim 1s ease-in-out',
};
```

## 项目结构

```
lively-mascot/
├── index.html              # 演示站点：Hero + 颜色/表情 Tab 面板
├── src/
│   ├── core/
│   │   ├── emotions.js     # 表情定义（纯数据）
│   │   └── rig.js          # 动画引擎
│   ├── lively-mascot.js    # 核心 SDK
│   └── lively-mascot.css   # 动画样式
├── package.json
└── README.md
```

## 许可证

MIT
