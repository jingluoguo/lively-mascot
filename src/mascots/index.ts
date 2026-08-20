import type { MascotCharacter, MascotType } from "../types";
import { SproutView } from "./sprout/Sprout";

/**
 * 角色注册表：加新角色 = 新写一个 SVG 组件 + 在这里注册一行。
 * 动效层（useMascotRig + CSS）对角色完全透明，注册即白送。
 */
export const mascots = {
  sprout: {
    id: "sprout",
    name: "Sprout",
    viewBox: "0 0 100 100",
    component: SproutView,
  },
} satisfies Record<MascotType, MascotCharacter>;
