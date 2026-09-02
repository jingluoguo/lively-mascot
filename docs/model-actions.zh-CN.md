# 模型动作目录

本文档是模型接入时可声明动作的目录。代码中的 `LivelyMascot.partActions` 是运行时唯一来源；本文件说明语义和接入规则。

## 使用方式

```js
var actions = LivelyMascot.partActions;

LivelyMascot.defineModel({
  id: "my-model",
  parts: {
    body: { actions: actions.body },
    eyes: { actions: actions.eyes },
    mouth: { actions: actions.mouth },
    top: { actions: ["idle", "perk", "droop"] }
  }
  // ...
});
```

模型只能声明真实存在的部件和它能表现的动作。情绪配方要求不存在的部件或动作时，运行时会跳过该项。

## 标准部件与动作

| 部件 | 动作 | 语义 |
| --- | --- | --- |
| `body` | `idle`, `breathe`, `wake`, `rest` | 中性、呼吸、苏醒、休止 |
| `body` | `bounce`, `shake`, `pulse`, `work`, `dim`, `refresh` | 开心弹跳、震动、心跳、工作节奏、低能量、刷新 |
| `eyes` | `open`, `closed`, `happy`, `wide`, `sad` | 睁眼、闭眼、开心、睁大、难过 |
| `eyes` | `angry`, `love`, `thinking`, `bored`, `cry` | 生气、心动、思考、无聊、哭泣 |
| `mouth` | `neutral`, `smile`, `open`, `flat`, `frown`, `talk` | 中性、微笑、张口、平直、皱眉、说话 |
| `top` | `idle`, `perk`, `droop`, `shake`, `listen`, `work` | 顶部部件中性、竖起、下垂、抖动、倾听、工作 |
| `feet` | `rest`, `step`, `stomp`, `happy` | 静止、迈步、跺脚、欢快步伐 |
| `tail` | `idle`, `happy`, `droop`, `puff`, `tuck` | 中性、摇摆、下垂、炸毛、收起 |
| `accessory` | `idle`, `happy`, `alert` | 中性、欢快、警觉 |

`top` 适用于耳朵、叶子、天线、角等顶部结构。`accessory` 适用于胡须、固定徽记等模型固有但不属于主体骨架的永久细节：在 `parts.accessory` 中声明，并用 `model.registerPart("accessory", node)` 注册，它会始终显示。自定义部件可以使用自己的名称，但应先确认其动作会被至少两个模型或一个明确产品需求复用。

## 可切换配件

帽子、眼镜等可选物件在模型定义的 `accessories` 中声明，并在渲染时绑定实际节点：

```js
accessories: {
  glasses: { default: false, actions: ["idle", "alert"] },
  hat: { default: true, actions: ["idle", "happy"] }
},
render: function (model, container) {
  // 创建 glasses、hat 节点并挂到正确的视觉层级。
  model.registerAccessory("glasses", glasses);
  model.registerAccessory("hat", hat);
}
```

实例可独立切换，多个配件可以同时开启：

```js
mascot.setAccessory("glasses", true);
mascot.setAccessory("hat", false);
```

`getAccessories()` 返回当前启用状态。情绪配方的 `accessory` 动作只会下发到已启用且声明支持该动作的配件。未声明的配件名称会抛出错误，避免静默拼写错误。

胡须、永久佩戴的帽子等模型固有细节不能放进 `accessories`；它们使用 `parts.accessory` 和 `model.registerPart("accessory", node)`，因此不会出现在 `getAccessories()` 中，也不能被 `setAccessory()` 隐藏。

## CSS 接收动作

引擎将当前动作写在真实部件节点上，例如：

```css
.lively-mascot--my-model [data-mascot-part="top"][data-mascot-action-top="perk"] {
  transform: translateY(-2px);
}
```

配件使用 `[data-mascot-accessory="glasses"][data-mascot-action-accessory="alert"]` 编写局部动画。

不要用 CSS 自行判断 `.is-emotion-XX` 来实现新的通用动作。情绪意图应先写入 `src/core/emotions.js` 的 `recipe`，模型 CSS 只实现本模型的部件外观和局部动作。

## 换皮与固定身份色

`skin.slots` 允许 `setTheme()` 修改 `body`、`outline`、`accent`。瞳色、斑纹、脸颊、徽记等身份元素放在 `skin.fixed`：

```js
skin: {
  slots: ["body", "outline", "accent"],
  fixed: { pupil: "#17212a", "identity-mark": "#f4e7d0" }
}
```

固定色会暴露为 `--lively-fixed-pupil`、`--lively-fixed-identity-mark`，模型 CSS 应使用带回退值的变量，例如 `fill: var(--lively-fixed-pupil, var(--lively-outline))`。`setTheme()` 不接受也不会改写这些颜色。

## 维护规则

- 先复用现有动作；动作名称表达意图，不描述具体 CSS 实现。
- 只有多个模型需要同一语义时，才加入 `partActions` 和情绪配方。
- 新增标准动作时，同步更新本文件、`types/index.d.ts` 中的说明，以及至少一个内置模型的验证。
- 删除或改名标准动作属于破坏性变更，必须同时迁移所有模型定义和情绪配方。
