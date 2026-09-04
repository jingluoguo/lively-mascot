# 更新日志

[English](CHANGELOG.md)

这里记录项目的重要更新。

## [0.3.0] - 2026-09-04

这次升级聚焦于模型扩展契约和运行时能力，让自定义模型、情绪编排与运行时控制更容易接入，同时保留熟悉的角色、情绪和 2D / 3D 模式。

### 公共 API

- 用声明式 `defineModel()` / `models` 替代旧的 `registerCharacter()` / `characters` 扩展入口。
- 新增部件与动作、皮肤槽位、固定皮肤值、配件、特效锚点、展示元数据和 rig 能力等模型契约。
- 新增 `defineEmotion()`，支持字符串 ID 和语义 `behaviors`；情绪配方可以分发部件动作和锚点特效。
- 新增 `getCapabilities()`、`getSkin()`、`getAccessories()` 和 `setAccessory()` 运行时查询与控制接口。

### 运行时与演示页

- 新增按眼睛调节的注视参数，以及“仅眼睛 / 整个模型”的注视范围和模型级眨眼、注视、跳跃、旋转能力控制。
- 新增带 `ariaLabel` 的键盘可访问点击交互，以及按模型恢复默认配色的能力。
- 演示页新增脸型变体、原生颜色取色器、模型默认色卡和动作编排器。
- 模型加载改为自动发现成对的 `*.model.js` / `*.model.css` 文件，并提供按角色引入 CSS 的方式。
- 页面隐藏或系统要求减少动态效果时，注视、眨眼、跳跃和定时器会暂停，恢复后自动继续。

### 发布与文档

- 新增 ESM / CJS 专用 TypeScript 类型入口、Node.js 版本要求和更精确的 npm 副作用声明。
- 新增模型 / 动作集成指南，并更新图像转模型契约文档。

## [0.2.0] - 2026-08-26

### 新增

- 新增 `animated: false` 静态渲染模式，用于缩略图和非动画场景。
- 新增 2D / 3D 视图模式，包含轻量景深、材质高光和基于光标的姿态变化。
- 新增 `outlineVisible` / `setOutlineVisible()`，以及声明式 `show-outline` 属性。
- 新增通过 `registerFaceAccessory()` 和 `setFaceAccessory()` 注册、切换脸部配饰的能力。
- 新增 npm CommonJS、ESM 入口，浏览器 CDN 元数据和 TypeScript 类型声明。
- 新增中英文演示预览图，并扩展交互式演示控制项。

### 变更

- 重绘 Cat 角色：炭灰配色、悬浮胡须、面部细节和尾巴几何结构全面更新。
- 改进 3D 姿态：支持 pitch/yaw 头部转向、随光标变化的高光和视角体积补偿。
- 3D 模式下将 Cat 尾巴移至身体后方，并拆分为分层动画通道。
- 重做 Loading 状态：使用共享旋转环和整 rig 弹跳；柔化全局阴影并同步脚掌滤镜与表情状态。
- 自动 Hop 改为按表情门控，避免打断无关状态。
- 重绘 Bored 表情，并调整 Sprout、Cat、Robot 的直立呼吸动画。
- 使用 mask 修复 Ghost 下摆可见接缝。
- README 改为优先介绍 npm 引入，同时保留 CDN、本地分文件和框架集成方式。

### 修复

- 修复源码 CommonJS 加载时表情注册表为空的问题。
- 修复 npm 入口在 Node/CommonJS 环境下未自动注册内置角色的问题。

### 发布

- 将构建所需的 `esbuild` 移至 `devDependencies`。
- 将 `dist/lively-mascot.cjs`、`dist/lively-mascot.mjs`、`types/index.d.ts` 纳入发布包。
