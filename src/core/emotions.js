/**
 * lively-mascot · Emotion Definitions
 *
 * Grouped by:
 * - Lifecycle (00-09): Core states like idle, sleeping, waking up.
 * - Reactions (10-19): Immediate responses to user actions.
 * - Work States (20-31): What the bot/agent is doing (thinking, searching, etc.).
 *
 * Each emotion can define:
 * - behaviors: semantic behavior tags for model-specific presentation
 * - bodyAnim:   CSS animation override for .lively-body
 * - bodyFilter: CSS filter override for .lively-body
 * - blink:      false = force eyes closed/locked (default true)
 * - gaze:       false = pause cursor tracking (default true)
 * - hop:        true = allow interval-driven hopping for this expression
 * - leafAnim:   CSS animation override for .lively__leaf
 * - footAnim:   CSS animation override for .lively__foot
 */

var LivelyEmotions = {
  // ===================== LIFECYCLE (00-09) =====================
  "00": { id: "00", name: "Sleep",      group: "lifecycle", desc: "深度睡眠",
          blink: false, gaze: false,
          bodyFilter: "brightness(0.55) saturate(0.6)",
          leafAnim: "lively-leaf-sleep 6s ease-in-out infinite",
          footAnim: "lively-foot-rest 4s ease-in-out infinite" },
  "01": { id: "01", name: "Wake",       group: "lifecycle", desc: "刚睡醒",
          bodyAnim: "lively-wake 1.2s ease-out",
          leafAnim: "lively-leaf-wake 0.8s ease-out",
          footAnim: "lively-foot-wake 0.6s ease-out" },
  "02": { id: "02", name: "Idle",       group: "lifecycle", desc: "待机" },
  "03": { id: "03", name: "Breathe",    group: "lifecycle", desc: "平稳呼吸",
          bodyAnim: "lively-deep-breathe 4s ease-in-out infinite",
          leafAnim: "lively-leaf-breathe 4s ease-in-out infinite",
          footAnim: "lively-foot-rest 4s ease-in-out infinite" },
  "04": { id: "04", name: "Ready",      group: "lifecycle", desc: "随时待命",
          bodyAnim: "lively-ready 2s ease-in-out infinite",
          leafAnim: "lively-leaf-ready 1.5s ease-in-out infinite",
          footAnim: "lively-foot-ready 1.8s ease-in-out infinite" },
  "05": { id: "05", name: "Pause",      group: "lifecycle", desc: "暂停中",
          bodyFilter: "saturate(0.4) brightness(0.85)",
          leafAnim: "lively-leaf-pause 6s ease-in-out infinite",
          footAnim: "lively-foot-rest 4s ease-in-out infinite" },
  "06": { id: "06", name: "Refresh",    group: "lifecycle", desc: "正在刷新",
          motionTarget: "rig",
          bodyAnim: "lively-refresh 0.8s ease-in-out infinite",
          leafAnim: "lively-leaf-refresh 0.6s ease-in-out infinite" },
  "07": { id: "07", name: "LowBattery", group: "lifecycle", desc: "电量不足",
          bodyFilter: "saturate(0.3) brightness(0.7)",
          bodyAnim: "lively-lowbatt 2.5s ease-in-out infinite",
          leafAnim: "lively-leaf-droop 3s ease-in-out infinite",
          footAnim: "lively-foot-rest 5s ease-in-out infinite" },
  "08": { id: "08", name: "Offline",    group: "lifecycle", desc: "已离线",
          blink: false, gaze: false,
          bodyFilter: "grayscale(1) brightness(0.5)",
          leafAnim: "lively-leaf-droop 8s ease-in-out infinite" },
  "09": { id: "09", name: "Boot",       group: "lifecycle", desc: "启动中",
          bodyAnim: "lively-boot 0.5s ease-in-out 3",
          leafAnim: "lively-leaf-boot 0.4s ease-out 3",
          footAnim: "lively-foot-boot 0.3s ease-out 3" },

  // ===================== REACTIONS (10-19) =====================
  "10": { id: "10", name: "Happy",     group: "reaction", desc: "开心",
          gaze: false,
          bodyAnim: "lively-happy-bounce 0.6s ease-in-out 2",
          leafAnim: "lively-leaf-happy 0.4s ease-in-out 4",
          footAnim: "lively-foot-happy 0.35s ease-in-out 4" },
  "11": { id: "11", name: "Curious",   group: "reaction", desc: "好奇",
          gaze: false,
          bodyAnim: "lively-confused 2.4s ease-in-out infinite",
          leafAnim: "lively-leaf-confused 1.8s ease-in-out infinite" },
  "12": { id: "12", name: "Aggrieved", group: "reaction", desc: "委屈",
          gaze: false,
          bodyAnim: "lively-sad 3s ease-in-out infinite",
          bodyFilter: "brightness(0.85) saturate(0.7)",
          leafAnim: "lively-leaf-droop 2s ease-in-out infinite",
          footAnim: "lively-foot-rest 4s ease-in-out infinite" },
  "13": { id: "13", name: "Angry",     group: "reaction", desc: "生气",
          gaze: false,
          bodyAnim: "lively-angry 0.15s linear infinite",
          bodyFilter: "hue-rotate(340deg) saturate(1.5) brightness(0.95)",
          leafAnim: "lively-leaf-angry 0.12s linear infinite",
          footAnim: "lively-foot-stomp 0.18s ease-in-out infinite" },
  "14": { id: "14", name: "Surprised", group: "reaction", desc: "惊讶",
          gaze: false,
          bodyAnim: "lively-surprise 0.5s ease-out",
          leafAnim: "lively-leaf-wake 0.5s ease-out" },
  "15": { id: "15", name: "Shy",       group: "reaction", desc: "害羞",
          gaze: false,
          bodyAnim: "lively-confused 2s ease-in-out infinite",
          leafAnim: "lively-leaf-shy 2s ease-in-out infinite" },
  "16": { id: "16", name: "Love",      group: "reaction", desc: "心动",
          gaze: false,
          bodyAnim: "lively-love-pulse 0.8s ease-in-out infinite",
          leafAnim: "lively-leaf-happy 0.6s ease-in-out infinite" },
  "17": { id: "17", name: "Confused",  group: "reaction", desc: "困惑",
          bodyAnim: "lively-confused 2s ease-in-out infinite",
          leafAnim: "lively-leaf-confused 1.5s ease-in-out infinite" },
  "18": { id: "18", name: "Cool",      group: "reaction", desc: "耍酷",
          bodyFilter: "contrast(1.15) brightness(1.05)",
          leafAnim: "lively-leaf-ready 2s ease-in-out infinite" },
  "19": { id: "19", name: "Smug",      group: "reaction", desc: "得意",
          bodyAnim: "lively-smug 2s ease-in-out infinite",
          leafAnim: "lively-leaf-ready 1.8s ease-in-out infinite" },

  // ===================== WORK STATES (20-31) =====================
  "20": { id: "20", name: "Thinking",   group: "work", desc: "思考中",
          blink: false,
          bodyAnim: "lively-thinking 2.5s ease-in-out infinite",
          leafAnim: "lively-leaf-thinking 2s ease-in-out infinite" },
  "21": { id: "21", name: "Listening",  group: "work", desc: "倾听中",
          bodyAnim: "lively-listening 2s ease-in-out infinite",
          leafAnim: "lively-leaf-listen 1.8s ease-in-out infinite" },
  "22": { id: "22", name: "Talking",    group: "work", desc: "说话中",
          bodyAnim: "lively-talking 0.5s ease-in-out infinite",
          leafAnim: "lively-leaf-talking 0.8s ease-in-out infinite" },
  "23": { id: "23", name: "Searching",  group: "work", desc: "搜索中",
          bodyAnim: "lively-searching 1.5s ease-in-out infinite",
          leafAnim: "lively-leaf-searching 1.2s ease-in-out infinite",
          footAnim: "lively-foot-pace 0.8s ease-in-out infinite" },
  "24": { id: "24", name: "Reading",    group: "work", desc: "阅读中",
          bodyAnim: "lively-reading 3s ease-in-out infinite",
          leafAnim: "lively-leaf-reading 2.5s ease-in-out infinite" },
  "25": { id: "25", name: "Writing",    group: "work", desc: "写作中",
          bodyAnim: "lively-writing 1.8s ease-in-out infinite",
          leafAnim: "lively-leaf-writing 1.5s ease-in-out infinite",
          footAnim: "lively-foot-writing 1.2s ease-in-out infinite" },
  "26": { id: "26", name: "Coding",     group: "work", desc: "编程中",
          blink: false,
          bodyAnim: "lively-coding 2.5s ease-in-out infinite",
          leafAnim: "lively-leaf-coding 2s ease-in-out infinite" },
  "27": { id: "27", name: "Designing",  group: "work", desc: "设计中",
          bodyAnim: "lively-designing 3s ease-in-out infinite",
          leafAnim: "lively-leaf-designing 2.5s ease-in-out infinite" },
  "28": { id: "28", name: "Loading",    group: "work", desc: "加载中",
          gaze: false,
          motionTarget: "rig",
          // Loading state is communicated by the rotated ring (CSS).
          // Disable the base body sway so the ring stays concentric; the
          // whole rig bounces instead to make the live mascot feel alive.
          bodyAnim: "lively-loading-bounce 0.9s ease-in-out infinite",
          footAnim: "lively-foot-rest 3s ease-in-out infinite" },
  "29": { id: "29", name: "Processing", group: "work", desc: "处理中",
          bodyAnim: "lively-processing 1.5s ease-in-out infinite",
          leafAnim: "lively-leaf-thinking 1.2s ease-in-out infinite" },
  "30": { id: "30", name: "Success",    group: "work", desc: "任务完成",
          gaze: false,
          bodyAnim: "lively-success 0.7s ease-out",
          leafAnim: "lively-leaf-happy 0.5s ease-out 2" },
  "31": { id: "31", name: "Error",      group: "work", desc: "发生错误",
          gaze: false,
          bodyFilter: "brightness(0.8) saturate(0.6)",
          bodyAnim: "lively-error 0.25s linear 4",
          leafAnim: "lively-leaf-error 0.2s linear 4" },

  // ===================== EXTENDED (32-34) =====================
  "32": { id: "32", name: "Grateful",   group: "reaction", desc: "感谢",
          gaze: false,
          bodyAnim: "lively-love-pulse 1.2s ease-in-out infinite",
          leafAnim: "lively-leaf-happy 1s ease-in-out infinite" },
  "33": { id: "33", name: "Retrying",   group: "work", desc: "重试中",
          bodyAnim: "lively-searching 1.2s ease-in-out infinite",
          leafAnim: "lively-leaf-confused 1s ease-in-out infinite",
          footAnim: "lively-foot-pace 0.6s ease-in-out infinite" },
  "34": { id: "34", name: "Cancelled",  group: "work", desc: "已取消",
          bodyFilter: "saturate(0.5) brightness(0.8)",
          leafAnim: "lively-leaf-droop 3s ease-in-out infinite",
          footAnim: "lively-foot-rest 3s ease-in-out infinite" },
  "35": { id: "35", name: "Crying",     group: "reaction", desc: "哭泣",
          gaze: false,
          bodyFilter: "brightness(0.9) saturate(0.8)",
          bodyAnim: "lively-sad 2s ease-in-out infinite",
          leafAnim: "lively-leaf-droop 1.5s ease-in-out infinite",
          footAnim: "lively-foot-rest 3s ease-in-out infinite" },
  "36": { id: "36", name: "Bored",      group: "reaction", desc: "无聊",
          bodyAnim: "lively-bored 4s ease-in-out infinite",
          leafAnim: "lively-leaf-droop 5s ease-in-out infinite",
          footAnim: "lively-foot-rest 4s ease-in-out infinite" },
  "37": { id: "37", name: "Nervous",    group: "reaction", desc: "紧张",
          bodyAnim: "lively-nervous 0.8s ease-in-out infinite",
          leafAnim: "lively-leaf-nervous 0.6s ease-in-out infinite",
          footAnim: "lively-foot-nervous 0.3s ease-in-out infinite" },
  "38": { id: "38", name: "Eureka",     group: "reaction", desc: "灵光一现",
          gaze: false,
          bodyAnim: "lively-eureka 0.6s ease-out",
          leafAnim: "lively-leaf-eureka 0.4s ease-out 2",
          footAnim: "lively-foot-happy 0.3s ease-out 3" },
  "39": { id: "39", name: "Waiting",    group: "work", desc: "等待中",
          bodyAnim: "lively-waiting 2s ease-in-out infinite",
          leafAnim: "lively-leaf-waiting 1.5s ease-in-out infinite",
          footAnim: "lively-foot-tap 0.5s ease-in-out infinite" }
};

var LivelyEmotionGroups = {
  "lifecycle": { name: "生命周期", order: 0 },
  "reaction":  { name: "情绪反应", order: 1 },
  "work":      { name: "工作状态", order: 2 }
};

// The recipe is the model-independent intent behind each visual state. The
// rig still owns its proven motion values above; a model only receives actions
// for parts it explicitly declared, and unsupported effects are skipped.
var LivelyEmotionRecipes = {
  "00": { parts: { body: "rest", eyes: "closed", mouth: "flat", top: "droop", feet: "rest" }, effects: [{ type: "sleep", anchor: "head", count: 2 }] },
  "01": { parts: { body: "wake", eyes: "wide", mouth: "open", top: "perk", feet: "rest" } },
  "02": { parts: { body: "idle", eyes: "open", mouth: "neutral", top: "idle", feet: "rest", tail: "idle" } },
  "03": { parts: { body: "breathe", eyes: "open", mouth: "neutral", top: "idle", feet: "rest" } },
  "04": { parts: { body: "breathe", eyes: "open", mouth: "neutral", top: "perk", feet: "rest" } },
  "05": { parts: { body: "rest", eyes: "sad", mouth: "flat", top: "droop", feet: "rest" } },
  "06": { parts: { body: "refresh", eyes: "open", mouth: "neutral", top: "work", feet: "rest" } },
  "07": { parts: { body: "dim", eyes: "sad", mouth: "frown", top: "droop", feet: "rest" } },
  "08": { parts: { body: "dim", eyes: "closed", mouth: "flat", top: "droop", feet: "rest" } },
  "09": { parts: { body: "wake", eyes: "wide", mouth: "open", top: "perk", feet: "step" } },
  "10": { parts: { body: "bounce", eyes: "happy", mouth: "smile", top: "perk", feet: "happy", tail: "happy", accessory: "happy" }, effects: [{ type: "sparkles", anchor: "head" }] },
  "11": { parts: { body: "work", eyes: "wide", mouth: "open", top: "perk", tail: "idle" } },
  "12": { parts: { body: "dim", eyes: "sad", mouth: "frown", top: "droop", feet: "rest", tail: "droop" } },
  "13": { parts: { body: "shake", eyes: "angry", mouth: "frown", top: "shake", feet: "stomp", tail: "puff" } },
  "14": { parts: { body: "wake", eyes: "wide", mouth: "open", top: "perk", accessory: "alert" } },
  "15": { parts: { body: "work", eyes: "sad", mouth: "smile", top: "droop" } },
  "16": { parts: { body: "pulse", eyes: "love", mouth: "smile", top: "perk", tail: "happy" }, effects: [{ type: "hearts", anchor: "head", count: 3 }] },
  "17": { parts: { body: "work", eyes: "sad", mouth: "frown", top: "work" } },
  "18": { parts: { body: "idle", eyes: "open", mouth: "smile", top: "perk" } },
  "19": { parts: { body: "work", eyes: "open", mouth: "smile", top: "perk" } },
  "20": { parts: { body: "work", eyes: "thinking", mouth: "flat", top: "work" } },
  "21": { parts: { body: "work", eyes: "open", mouth: "neutral", top: "listen", accessory: "alert" } },
  "22": { parts: { body: "work", eyes: "open", mouth: "talk", top: "work" } },
  "23": { parts: { body: "work", eyes: "open", mouth: "neutral", top: "work", feet: "step" } },
  "24": { parts: { body: "work", eyes: "thinking", mouth: "smile", top: "work" } },
  "25": { parts: { body: "work", eyes: "thinking", mouth: "neutral", top: "work", feet: "step" } },
  "26": { parts: { body: "work", eyes: "thinking", mouth: "flat", top: "work" } },
  "27": { parts: { body: "work", eyes: "happy", mouth: "smile", top: "work" } },
  "28": { parts: { body: "bounce", eyes: "thinking", mouth: "flat", feet: "rest" }, effects: [{ type: "loading", anchor: "body", count: 1 }] },
  "29": { parts: { body: "work", eyes: "thinking", mouth: "flat", top: "work" } },
  "30": { parts: { body: "bounce", eyes: "happy", mouth: "smile", top: "perk", feet: "happy" }, effects: [{ type: "sparkles", anchor: "head" }] },
  "31": { parts: { body: "shake", eyes: "closed", mouth: "frown", top: "shake", feet: "stomp" } },
  "32": { parts: { body: "pulse", eyes: "happy", mouth: "smile", top: "perk" }, effects: [{ type: "hearts", anchor: "head", count: 2 }] },
  "33": { parts: { body: "work", eyes: "thinking", mouth: "neutral", top: "work", feet: "step" } },
  "34": { parts: { body: "rest", eyes: "sad", mouth: "frown", top: "droop", feet: "rest" } },
  "35": { parts: { body: "dim", eyes: "cry", mouth: "frown", top: "droop", feet: "rest", tail: "droop" } },
  "36": { parts: { body: "rest", eyes: "bored", mouth: "flat", top: "droop", feet: "rest" } },
  "37": { parts: { body: "shake", eyes: "sad", mouth: "neutral", top: "shake", feet: "step", tail: "tuck" } },
  "38": { parts: { body: "bounce", eyes: "wide", mouth: "smile", top: "perk", feet: "happy", accessory: "alert" }, effects: [{ type: "sparkles", anchor: "head", count: 4 }] },
  "39": { parts: { body: "work", eyes: "open", mouth: "flat", top: "idle", feet: "step" } }
};

// Semantic behavior tags are intentionally separate from numeric IDs. Models
// can react to "angry" or "loading" without knowing which registry ID maps
// to that intent, and custom emotions can provide their own tags.
var LivelyEmotionBehaviors = {
  "00": ["sleep"], "01": ["wake"], "02": ["idle"], "03": ["breathe"],
  "04": ["ready"], "05": ["pause"], "06": ["refresh", "spin"], "07": ["low-battery"],
  "08": ["offline"], "09": ["boot"], "10": ["happy"], "11": ["curious"],
  "12": ["sad"], "13": ["angry"], "14": ["surprised"], "15": ["shy"],
  "16": ["love"], "17": ["confused"], "18": ["cool"], "19": ["smug"],
  "20": ["thinking"], "21": ["listening"], "22": ["talking"], "23": ["searching"],
  "24": ["reading"], "25": ["writing"], "26": ["coding"], "27": ["designing"],
  "28": ["loading", "spin"], "29": ["processing"], "30": ["success"], "31": ["error"],
  "32": ["grateful"], "33": ["retrying"], "34": ["cancelled"], "35": ["crying"],
  "36": ["bored"], "37": ["nervous"], "38": ["eureka"], "39": ["waiting"]
};

for (var emotionId in LivelyEmotionRecipes) {
  if (Object.prototype.hasOwnProperty.call(LivelyEmotionRecipes, emotionId) && LivelyEmotions[emotionId]) {
    LivelyEmotions[emotionId].recipe = LivelyEmotionRecipes[emotionId];
  }
}
for (var behaviorId in LivelyEmotionBehaviors) {
  if (Object.prototype.hasOwnProperty.call(LivelyEmotionBehaviors, behaviorId) && LivelyEmotions[behaviorId]) {
    LivelyEmotions[behaviorId].behaviors = LivelyEmotionBehaviors[behaviorId].slice();
  }
}

// Keep the no-build browser global while making the data consumable from
// Node/CommonJS when the source SDK is used as an npm entry point.
if (typeof module === "object" && module.exports) {
  module.exports = { emotions: LivelyEmotions, groups: LivelyEmotionGroups };
}
if (typeof globalThis !== "undefined") {
  globalThis.LivelyEmotions = LivelyEmotions;
  globalThis.LivelyEmotionGroups = LivelyEmotionGroups;
}
