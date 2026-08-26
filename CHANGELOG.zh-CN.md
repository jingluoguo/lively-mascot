# 更新日志

[English](CHANGELOG.md)

这里记录项目的重要更新。

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
- 修复 npm 入口在 Node/CommonJS 环境下未自动注册 5 个内置角色的问题。

### 发布

- 将构建所需的 `esbuild` 移至 `devDependencies`。
- 将 `dist/lively-mascot.cjs`、`dist/lively-mascot.mjs`、`types/index.d.ts` 纳入发布包。
