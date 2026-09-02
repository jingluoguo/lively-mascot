export type ViewMode = "2d" | "3d";

export interface MascotOptions {
  type?: string;
  color?: string;
  outline?: string;
  accent?: string;
  size?: number;
  followCursor?: boolean;
  viewMode?: ViewMode;
  mode?: ViewMode;
  outlineVisible?: boolean;
  animated?: boolean;
  hopInterval?: [number, number] | null;
  onClick?: () => void;
}

export interface MascotInstance {
  readonly el: HTMLElement;
  readonly type: string;
  readonly viewMode: ViewMode;
  readonly outlineVisible: boolean;
  getCapabilities(): ModelCapabilities;
  getSkin(): { slots: { body: string; outline: string; accent: string }; fixed: Record<string, string> };
  getAccessories(): Record<string, { enabled: boolean; default: boolean; actions: string[] }>;
  setViewMode(mode: ViewMode): ViewMode;
  setOutlineVisible(visible: boolean): boolean;
  setFaceVariant(variant: "default" | "simple" | "dot"): "default" | "simple" | "dot";
  setTheme(theme: { body?: string; outline?: string; accent?: string }): void;
  setAccessory(id: string, enabled: boolean): boolean;
  setEmotion(id: string | number): void;
  clearEmotion(): void;
  destroy(): void;
}

export interface EmotionDefinition {
  id: string;
  name: string;
  group: string;
  desc: string;
  bodyAnim?: string;
  bodyFilter?: string;
  leafAnim?: string;
  footAnim?: string;
  blink?: boolean | "fast";
  gaze?: boolean;
  hop?: boolean;
  recipe?: EmotionRecipe;
  [key: string]: unknown;
}

export interface EmotionRecipe {
  parts?: Record<string, string>;
  effects?: Array<{ type: string; anchor: string; count?: number }>;
}

export interface ModelPartDefinition {
  actions: string[];
}

export interface ModelCapabilities {
  parts: Record<string, ModelPartDefinition>;
  gaze: { scope: "model" | "eyes" };
  skin: { slots: string[]; fixed: Record<string, string> };
  accessories: Record<string, ModelAccessoryDefinition>;
  effects: { supported: string[]; anchors: Record<string, { x: number; y: number }> };
}

export interface ModelAccessoryDefinition {
  default: boolean;
  actions: string[];
}

export interface ModelAccessoryConfig {
  default?: boolean;
  actions?: string[];
}

export interface ModelRuntime {
  rig: object;
  registerPart(name: string, element: Element, options?: { gaze?: { maxX?: number; maxY?: number; scale?: number; rotate?: number; depth?: number; side?: "left" | "right"; sideScale?: number }; useEmotionAnimation?: boolean }): void;
  registerAccessory(id: string, element: Element): void;
  setAccessory(id: string, enabled: boolean): boolean;
  getParts(): Record<string, Element[]>;
  getAccessories(): Record<string, { enabled: boolean; default: boolean; actions: string[] }>;
}

export interface ModelDefinition {
  id: string;
  name?: string;
  viewBox?: string;
  parts?: Record<string, ModelPartDefinition | true>;
  gaze?: { scope?: "model" | "eyes" };
  skin?: { slots?: string[]; fixed?: Record<string, string> | string[] };
  accessories?: Record<string, ModelAccessoryConfig | true>;
  effects?: { supported?: string[]; anchors?: Record<string, { x: number; y: number }> };
  render(runtime: ModelRuntime, container: Element): void;
}

export const createMascot: (target: Element, options?: MascotOptions) => MascotInstance;
export const defineModel: (definition: ModelDefinition) => object;
export const defineMascotElement: (tag?: string) => void;
export const buildFaceSvg: (runtime: ModelRuntime) => { wrap: HTMLElement; face: SVGElement };
export const models: Record<string, object>;
export const partActions: Record<string, string[]>;
export const emotions: Record<string, EmotionDefinition>;
export const emotionGroups: Record<string, { name: string; order: number }>;
export const version: string;

declare const LivelyMascot: {
  createMascot: typeof createMascot;
  defineModel: typeof defineModel;
  defineMascotElement: typeof defineMascotElement;
  buildFaceSvg: typeof buildFaceSvg;
  models: typeof models;
  partActions: typeof partActions;
  emotions: typeof emotions;
  emotionGroups: typeof emotionGroups;
  version: typeof version;
};

export default LivelyMascot;
