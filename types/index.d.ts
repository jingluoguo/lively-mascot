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
  ariaLabel?: string;
}

export interface MascotInstance {
  readonly el: HTMLElement;
  readonly type: string;
  readonly viewMode: ViewMode;
  readonly outlineVisible: boolean;
  getCapabilities(): ModelCapabilities;
  getSkin(): { slots: Record<string, string>; fixed: Record<string, string> };
  getAccessories(): Record<string, { enabled: boolean; default: boolean; actions: string[] }>;
  setViewMode(mode: ViewMode): ViewMode;
  setOutlineVisible(visible: boolean): boolean;
  setFaceVariant(variant: "default" | "simple" | "dot"): "default" | "simple" | "dot";
  setTheme(theme: ThemeInput): void;
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
  behaviors?: string[];
  motionTarget?: "body" | "rig";
  recipe?: EmotionRecipe;
  [key: string]: unknown;
}

export interface EmotionDefinitionInput extends Omit<Partial<EmotionDefinition>, "id" | "behaviors"> {
  id: string;
  behaviors: string[];
}

export interface ThemeInput {
  body?: string | null;
  outline?: string | null;
  accent?: string | null;
}

export interface EmotionRecipe {
  parts?: Record<string, string>;
  effects?: Array<{ type: string; anchor: string; count?: number }>;
}

export interface ModelPartDefinition {
  actions: string[];
}

export interface ModelPresentation {
  icon: string;
  labels: { zh: string; en: string };
  greeting: { zh: string; en: string };
  order: number;
  theme: { body: string; outline: string; accent: string };
}

export interface ModelPresentationInput {
  icon?: string;
  labels?: Partial<ModelPresentation["labels"]>;
  greeting?: Partial<ModelPresentation["greeting"]>;
  order?: number;
  theme?: Partial<ModelPresentation["theme"]>;
}

export type RigCapabilityName = "blink" | "gaze" | "hop" | "spin";
export type RigCapabilities = Partial<Record<RigCapabilityName, boolean>>;

export interface ModelCapabilities {
  parts: Record<string, ModelPartDefinition>;
  gaze: { scope: "model" | "eyes" };
  rig: Record<RigCapabilityName, boolean>;
  skin: { slots: string[]; fixed: Record<string, string> };
  accessories: Record<string, ModelAccessoryDefinition>;
  effects: { supported: string[]; anchors: Record<string, { x: number; y: number }> };
  presentation: ModelPresentation;
}

export interface ModelAccessoryDefinition {
  default: boolean;
  actions: string[];
}

export interface ModelAccessoryConfig {
  default?: boolean;
  actions?: string[];
}

export interface RigApi {
  registerPupil(element: Element, options?: { maxX?: number; maxY?: number }): void;
  registerEye(element: Element, options?: { maxX?: number; maxY?: number; scale?: number; rotate?: number; depth?: number; verticalScale?: number; side?: "left" | "right"; sideScale?: number }): void;
  registerFace(element: Element): void;
  registerBody(element: Element): void;
  registerLeaf(element: Element, options?: { useLeafAnim?: boolean }): void;
  registerFeet(element: Element): void;
  registerGazeWrap(element: Element): void;
  setEmotionState(id: string): void;
}

export interface ModelRuntime {
  rig: RigApi;
  registerPart(name: string, element: Element, options?: { gaze?: { maxX?: number; maxY?: number; scale?: number; rotate?: number; depth?: number; verticalScale?: number; side?: "left" | "right"; sideScale?: number }; useEmotionAnimation?: boolean }): void;
  registerAccessory(id: string, element: Element): void;
  setAccessory(id: string, enabled: boolean): boolean;
  applyPose(recipe?: EmotionRecipe): void;
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
  presentation?: ModelPresentationInput;
  rig?: RigCapabilities;
  render(runtime: ModelRuntime, container: Element): void;
}

export interface RegisteredModel {
  id: string;
  name: string;
  viewBox: string;
  parts: Record<string, ModelPartDefinition>;
  gaze: { scope: "model" | "eyes" };
  skin: { slots: string[]; fixed: Record<string, string> };
  accessories: Record<string, ModelAccessoryDefinition>;
  effects: { supported: string[]; anchors: Record<string, { x: number; y: number }> };
  presentation: ModelPresentation;
  rig: Record<RigCapabilityName, boolean>;
  render(runtime: ModelRuntime, container: Element): void;
}

export const createMascot: (target: Element, options?: MascotOptions) => MascotInstance;
export const defineModel: (definition: ModelDefinition) => RegisteredModel;
export const defineEmotion: (definition: EmotionDefinitionInput) => EmotionDefinition;
export const defineMascotElement: (tag?: string) => void;
export const buildFaceSvg: (runtime: ModelRuntime) => { wrap: HTMLElement; face: SVGElement };
export const models: Record<string, RegisteredModel>;
export const partActions: Record<string, string[]>;
export const emotions: Record<string, EmotionDefinition>;
export const emotionGroups: Record<string, { name: string; order: number }>;
export const version: string;

declare const LivelyMascot: {
  createMascot: typeof createMascot;
  defineModel: typeof defineModel;
  defineEmotion: typeof defineEmotion;
  defineMascotElement: typeof defineMascotElement;
  buildFaceSvg: typeof buildFaceSvg;
  models: typeof models;
  partActions: typeof partActions;
  emotions: typeof emotions;
  emotionGroups: typeof emotionGroups;
  version: typeof version;
};

export default LivelyMascot;
