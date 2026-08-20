import type { CSSProperties } from "react";
import { useMascotRig } from "./hooks/useMascotRig";
import { mascots } from "./mascots";
import type { MascotProps } from "./types";

/**
 * 开箱即用的动画吉祥物。
 *
 * ```tsx
 * import { Mascot } from "lively-mascot";
 * import "lively-mascot/styles.css";
 *
 * <Mascot type="sprout" color="#48ff42" onClick={() => say("hi")} />
 * ```
 *
 * 内置动效：眼神跟随光标（rAF 平滑）、随机眨眼、身子摇摆、
 * 双脚交替踏步、头顶嫩芽摇曳、间歇小跳、点击开心（眯眼+果冻弹跳+踢腿）。
 * 全部由共享 rig + CSS 驱动，角色组件只负责「画」。
 */
export function Mascot({
  type = "sprout",
  color,
  outline,
  accent,
  size = 106,
  followCursor,
  hopInterval,
  onMascotClick,
  className,
  style,
  ...rest
}: MascotProps) {
  const rig = useMascotRig({ followCursor, hopInterval, onMascotClick });
  const character = mascots[type] ?? mascots.sprout;
  const Character = character.component;

  /* 主题色以 CSS 变量注入，角色 CSS 全部走 var(--lively-*) */
  const themeVars = {
    "--lively-body": color,
    "--lively-outline": outline,
    "--lively-accent": accent,
  } as CSSProperties;

  const classNames = [
    "lively-mascot",
    `lively-mascot--${type}`,
    rig.happy ? "is-happy" : "",
    rig.hopping ? "is-hopping" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rig.rootRef}
      className={classNames}
      style={{ width: size, height: size, ...themeVars, ...style }}
      onClick={rig.click}
      aria-hidden="true"
      {...rest}
    >
      <div className="lively-mascot__rig" ref={rig.rigRef}>
        <Character rig={rig} theme={{ body: color, outline, accent }} />
      </div>
    </div>
  );
}
