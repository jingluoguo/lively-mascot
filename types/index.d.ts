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
  setViewMode(mode: ViewMode): ViewMode;
  setOutlineVisible(visible: boolean): boolean;
  setTheme(theme: { body?: string; outline?: string; accent?: string }): void;
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
  [key: string]: unknown;
}

export const createMascot: (target: Element, options?: MascotOptions) => MascotInstance;
export const registerCharacter: (id: string, render: Function, name?: string, viewBox?: string) => void;
export const defineMascotElement: (tag?: string) => void;
export const buildFaceSvg: (api: object) => { wrap: HTMLElement; face: SVGElement };
export const characters: Record<string, object>;
export const emotions: Record<string, EmotionDefinition>;
export const emotionGroups: Record<string, { name: string; order: number }>;
export const version: string;

declare const LivelyMascot: {
  createMascot: typeof createMascot;
  registerCharacter: typeof registerCharacter;
  defineMascotElement: typeof defineMascotElement;
  buildFaceSvg: typeof buildFaceSvg;
  characters: typeof characters;
  emotions: typeof emotions;
  emotionGroups: typeof emotionGroups;
  version: typeof version;
};

export default LivelyMascot;
