import type { ComponentType, CSSProperties, HTMLAttributes } from "react";
import type { RigApi } from "./hooks/useMascotRig";

/** 内置角色 ID。新增角色时扩展此联合类型并注册到 mascots 表。 */
export type MascotType = "sprout";

/** 主题色：角色各部分共用的调色板。缺省项回退到角色默认值。 */
export type MascotTheme = {
  /** 身体主色 */
  body?: string;
  /** 描边 / 眼睛 / 阴影的墨色 */
  outline?: string;
  /** 点缀色（腮红、花蕊等），可选 */
  accent?: string;
};

/** 角色组件收到的 props：rig（动效注册 API）+ theme（配色） */
export type CharacterProps = {
  rig: RigApi;
  theme: MascotTheme;
};

/** 角色注册表条目：id / 展示名 / 画布尺寸 / 组件 */
export type MascotCharacter = {
  id: MascotType;
  /** 展示名（demo / 文档用） */
  name: string;
  /** SVG viewBox，如 "0 0 100 100" */
  viewBox: string;
  component: ComponentType<CharacterProps>;
};

/** <Mascot /> 组件的 props */
export type MascotProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "color" | "style"> & {
  /** 角色 ID，默认 "sprout" */
  type?: MascotType;
  /** 身体主色，默认 #48ff42 */
  color?: string;
  /** 描边 / 眼睛 / 阴影色，默认 #080808 */
  outline?: string;
  /** 点缀色（角色特有，如腮红），默认由角色决定 */
  accent?: string;
  /** 容器尺寸（px），默认 106 */
  size?: number;
  /** 是否跟随光标，默认 true */
  followCursor?: boolean;
  /** 间歇小跳间隔（秒），默认 [6, 13]；传 null 关闭 */
  hopInterval?: [number, number] | null;
  /** 点击回调 */
  onMascotClick?: () => void;
  /** 内联样式（size 会并入其中） */
  style?: CSSProperties;
};
