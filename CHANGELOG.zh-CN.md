# 更新日志

[English](CHANGELOG.md)

这里记录项目的重要更新。

## [0.3.0] - 2026-09-04

### 新增

- 新增声明式 `defineModel()` 自定义模型契约，统一描述部件、动作、皮肤槽位、配件、特效、展示元数据和 rig 能力。
- 新增情绪语义标签与字符串情绪 ID，模型样式不再依赖数字 ID。
- 新增模型动作配方、配件开关和锚点特效，支持爱心、闪光、睡眠和加载指示器等效果。
- 新增眼睛范围/整模型范围的注视注册，以及眨眼、注视、跳跃、旋转能力开关。
- 新增模型自动发现机制和按角色拆分的 CSS 发布文件，支持更小的按需引入。
- 新增交互式动作编排器，并扩展图像转模型技能契约文档。

### 变更

- 内置角色注册统一迁移到模型运行时和共享 SVG 五官构建器。
- 改进注视与 3D 姿态表现，支持按眼睛配置缩放、景深、旋转、垂直响应和模型级注视包装层。
- 演示页新增原生颜色取色器、模型默认色卡、脸型变体、自定义动作编排和中英文模型展示元数据。
- 默认使用各模型的 `presentation.theme`，同时保留实例级主题覆盖能力。
- 页面隐藏或启用 `prefers-reduced-motion` 时暂停注视、眨眼、跳跃和定时器，并在恢复后自动继续。
- 改进 npm 导出，补充 ESM/CJS 专用 TypeScript 类型声明、Node.js 版本要求和更精确的副作用声明。

### 修复

- 修复点击开心状态下默认眼珠仍叠加在笑眼上的问题。
- 修复清除自定义颜色后无法恢复当前模型默认配色的问题。

### 发布

- 新增 `types/index.d.mts` 和 `types/index.d.cts`，提升 ESM 与 CommonJS 用户的 TypeScript 解析兼容性。
- 重新生成浏览器、ESM、CommonJS、核心 CSS 和按角色 CSS 发布文件。

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
