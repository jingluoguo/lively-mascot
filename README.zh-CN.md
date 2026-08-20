# ✦ lively-mascot

[English](README.md) · **简体中文**

> 电子宠物引擎：40 种状态表情 · 5 个角色 · 纯 SVG 驱动 · 零依赖 · 纯数据配置 · 即插即用。

一套为聊天机器人、桌面宠物、网页插件及 AI 助手打造的表情系统。可选角色（🌱嫩芽 / 🐱小猫 / 🤖机器人 / 👻幽灵 / 🟢果冻），通过 `setEmotion(id)` 即可切换对应表情，每个表情自带独立的身体、附属件、四肢动画和面部表情。

**[在线预览](https://jingluoguo.github.io/lively-mascot/)**

## 特性

- **40 种状态表情**：覆盖生命周期（睡眠/待机）、情绪反应（开心/生气）、工作状态（思考/搜索）与扩展状态（无聊/紧张/灵光一现/等待）。
- **多角色内置**：随库附赠 5 个角色 —— **嫩芽**（植物系）、**小猫**（宠物系）、**机器人**（科技方块头+天线）、**幽灵**（圆顶浮空半透明、3 道波浪裙边）、**果冻**（Q 弹形变）。通过 `type` 选项切换，引擎层零改动。
- **全要素联动**：每个表情控制眼睛、嘴巴、腮红、身体、附属件（叶子/耳朵/尾巴）及四肢 —— 依据角色解剖结构提供独立动画通道。
- **配置驱动**：每个表情都是纯数据组合（动画 + 滤镜 + 行为参数），支持运行时注册新表情。
- **零依赖、零构建**：原生 JS，无框架依赖，按标准 `<script>` 标签顺序引入即可。
- **即插即用**：支持 Web Component `<lively-mascot>` 和函数式 API `createMascot`。
- **视线跟随**：眼睛平滑跟随指针；表情激活时自动暂停跟随，结束后平滑恢复。
- **主题化**：支持多实例主题切换（`setTheme`），所有样式基于 CSS 变量。

## 快速开始

```html
<!-- 核心：引擎样式 + 表情数据 + SDK -->
<link rel="stylesheet" href="src/lively-mascot.css" />
<script src="src/core/emotions.js"></script>
<script src="src/core/rig.js"></script>
<script src="src/lively-mascot.js"></script>

<!-- 角色样式 + 渲染器（角色之间引入顺序无关） -->
<link rel="stylesheet" href="src/characters/sprout.css" />
<link rel="stylesheet" href="src/characters/cat.css" />
<link rel="stylesheet" href="src/characters/robot.css" />
<link rel="stylesheet" href="src/characters/ghost.css" />
<link rel="stylesheet" href="src/characters/jelly.css" />
<script src="src/characters/sprout.js"></script>
<script src="src/characters/cat.js"></script>
<script src="src/characters/robot.js"></script>
<script src="src/characters/ghost.js"></script>
<script src="src/characters/jelly.js"></script>

<div id="slot"></div>
<script>
  // 嫩芽（植物系吉祥物）— 默认
  var s = LivelyMascot.createMascot(document.getElementById('slot'), {
    type: 'sprout', size: 180
  });

  // 小猫 / 机器人 / 幽灵 / 果冻 — 相同引擎，不同解剖结构
  // var c = LivelyMascot.createMascot(document.getElementById('slot'), {
  //   type: 'cat', size: 180
  // });

  // 切换表情（所有角色共用同一套 API）
  s.setEmotion('10'); // 开心
  s.setEmotion('20'); // 思考中
  s.clearEmotion();   // 恢复待机
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

角色就是一个 `render(api, gazeEl)` 函数：绘制自身 DOM，并通过 rig 的 **api** 注册动点。`gazeEl` 是所有角色的挂载容器，把部件挂在这里，整个角色就会随身体姿态一起倾斜/转向。

```js
function renderMyChar(rig, gazeEl) {
  // 1. 身体 —— 必须挂到 gazeEl 并注册
  var body = document.createElement('div');
  body.className = 'lively-body lively-body--myChar';
  rig.registerBody(body);

  // 2. 面部 —— 复用共享、自带表情逻辑的脸部构建器
  //    （眼睛/瞳孔在内部已接线，无需手动 registerEye/registerPupil）
  var face = LivelyMascot.buildFaceSvg(rig);
  body.appendChild(face.wrap);

  // 3. 可选顶部装饰（叶/耳/天线）→ registerLeaf
  //    传 { useLeafAnim: false } 则由你自己的 CSS 驱动其动作。
  //    rig.registerLeaf(decoEl, { useLeafAnim: false });

  // 4. 可选底部通道（脚/尾巴/裙边）→ registerFeet
  //    rig.registerFeet(feetEl);

  gazeEl.appendChild(body);
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
├── index.html                  # 演示站点：Hero + 颜色/表情 + 角色切换
├── src/
│   ├── core/
│   │   ├── emotions.js         # 40 种表情定义（纯数据）
│   │   └── rig.js              # 动画引擎（视线/眨眼/跳跃/情绪状态）
│   ├── characters/
│   │   ├── sprout.js / .css    # 嫩芽  （植物：身体 + 叶 + 脚）
│   │   ├── cat.js    / .css    # 小猫  （身体 + 耳朵 + 尾巴 + 爪）
│   │   ├── robot.js  / .css    # 机器人（方块头 + 天线 + 机械脚）
│   │   ├── ghost.js  / .css    # 幽灵  （圆顶半透明身体 + 体内 3 道波浪裙边）
│   │   └── jelly.js  / .css    # 果冻  （半透明 Q 弹，无叶无脚）
│   ├── lively-mascot.js        # 核心 SDK（角色注册表 + createMascot）
│   └── lively-mascot.css       # 引擎层样式（结构 + 情绪选择器）
├── package.json
└── README.md
```

## 许可证

MIT
