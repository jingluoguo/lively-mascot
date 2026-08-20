import { useCallback, useId } from "react";
import type { CharacterProps } from "../../types";

/**
 * 嫩芽团子（sprout）——首发角色。
 * 手绘贴纸风：墨描边 + 实心阴影 + 白色高光。
 * 单 SVG（viewBox 0 0 100 100），内部各部件挂共享 class：
 *   嫩芽 .lively-sprout__sprout（摇曳 / 开心转圈）
 *   身体 .lively-body（摇摆 / 果冻弹跳）
 *   脸   .lively-face（rig 注册，随视线微转）
 *   眼睛 / 瞳孔（rig 注册，眨眼 + 视线跟随）
 *   脚   .lively-foot（踏步 / 踢腿 / 收起）
 * 主题色全部走 --lively-* CSS 变量，角色不感知颜色。
 */
export function SproutView({ rig }: CharacterProps) {
  const clipId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  /* ref 回调用 useCallback 保持稳定，避免 React 每帧 detach/attach */
  const registerEyeL = useCallback((el: SVGGElement | null) => rig.registerEye(el), [rig.registerEye]);
  const registerEyeR = useCallback((el: SVGGElement | null) => rig.registerEye(el), [rig.registerEye]);
  const registerPupilL = useCallback(
    (el: SVGGElement | null) => rig.registerPupil(el, { maxX: 8, maxY: 6 }),
    [rig.registerPupil],
  );
  const registerPupilR = useCallback(
    (el: SVGGElement | null) => rig.registerPupil(el, { maxX: 8, maxY: 6 }),
    [rig.registerPupil],
  );
  const registerFace = useCallback((el: SVGGElement | null) => rig.registerFace(el), [rig.registerFace]);

  return (
    <svg className="lively-character" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <ellipse rx="10" ry="11.5" />
        </clipPath>
      </defs>

      {/* 嫩芽：从头顶探出，茎根部藏在身体后面（DOM 顺序在前） */}
      <g className="lively-sprout__sprout" transform="translate(24 -32)">
        <path className="lively-sprout__stem" d="M26 52 C26 42, 26 34, 26 27" />
        <path className="lively-sprout__leaf" d="M26 28 C22 15, 14 9, 6 12 C5 20, 12 29, 26 28 Z" />
        <path className="lively-sprout__vein" d="M23 26 C18 21, 12 16, 8 14" />
        <path className="lively-sprout__shine" d="M22 26 C16 16, 11 12, 7 14" />
        <path className="lively-sprout__leaf" d="M26 28 C30 15, 38 9, 46 12 C47 20, 40 29, 26 28 Z" />
        <path className="lively-sprout__vein" d="M29 26 C34 21, 40 16, 44 14" />
        <path className="lively-sprout__shine" d="M30 26 C36 16, 41 12, 45 14" />
      </g>

      {/* 身体：豆形贴纸 */}
      <g className="lively-body">
        <path
          d="M50 8 C74 8, 92 24, 92 48 C92 68, 80 86, 60 90 C55 92, 45 92, 40 90 C20 86, 8 68, 8 48 C8 24, 26 8, 50 8 Z"
          fill="var(--lively-body)"
          stroke="var(--lively-outline)"
          strokeWidth="2"
          filter="drop-shadow(5px 5px 0 var(--lively-outline))"
        />
      </g>

      {/* 脸：rig 注册，随视线微转 */}
      <g className="lively-face" ref={registerFace}>
        <ellipse className="lively-face__blush" cx="20" cy="57" rx="7" ry="4" />
        <ellipse className="lively-face__blush" cx="80" cy="57" rx="7" ry="4" />
        <g transform="translate(34 43)">
          <g className="lively-face__eye" ref={registerEyeL}>
            <ellipse rx="10" ry="11.5" />
            <g clipPath={`url(#${clipId})`}>
              <g ref={registerPupilL}>
                <circle className="lively-face__pupil" r="6.2" />
                <circle className="lively-face__shine" cx="2.2" cy="-2.4" r="2.1" />
              </g>
            </g>
            <path className="lively-face__happy" d="M-6.5 1.5 Q0 -6 6.5 1.5" />
          </g>
        </g>
        <g transform="translate(66 43)">
          <g className="lively-face__eye" ref={registerEyeR}>
            <ellipse rx="10" ry="11.5" />
            <g clipPath={`url(#${clipId})`}>
              <g ref={registerPupilR}>
                <circle className="lively-face__pupil" r="6.2" />
                <circle className="lively-face__shine" cx="2.2" cy="-2.4" r="2.1" />
              </g>
            </g>
            <path className="lively-face__happy" d="M-6.5 1.5 Q0 -6 6.5 1.5" />
          </g>
        </g>
        <path className="lively-face__mouth" d="M42 63 Q50 70 58 63" />
        <path className="lively-face__happy-mouth" d="M40 61 Q50 74 60 61 Q50 66 40 61 Z" />
      </g>

      {/* 双脚：墨色圆头弧线，交替踏步 */}
      <g className="lively-feet">
        <path
          className="lively-foot lively-foot--l"
          d="M22 88 Q29 96 38 94"
          fill="none"
          stroke="var(--lively-outline)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          className="lively-foot lively-foot--r"
          d="M62 94 Q71 96 78 88"
          fill="none"
          stroke="var(--lively-outline)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
