import { useCallback, useEffect, useRef, useState } from "react";

/** 瞳孔最大位移量（SVG 用户坐标）。角色按自己的眼睛大小声明，溢出由眼眶 clip 裁掉。 */
export type PupilSpec = {
  maxX: number;
  maxY: number;
};

type RegisteredPupil = {
  el: SVGGElement;
  spec: PupilSpec;
};

/** rig 暴露给角色组件的注册 API：角色只负责「画」 + 标记动点，动效全由 rig 驱动。 */
export type RigApi = {
  /** 注册一个瞳孔元素；卸载时传 null。spec 缺省 { maxX: 8, maxY: 6 } */
  registerPupil: (el: SVGGElement | null, spec?: PupilSpec) => void;
  /** 注册一只眼睛元素（眨眼时会被加 is-blinking class）；卸载时传 null */
  registerEye: (el: SVGElement | null) => void;
  /** 注册「脸」容器元素，视线跟随时会施加轻微旋转；可选 */
  registerFace: (el: SVGGElement | null) => void;
  /** 点击触发的开心状态（CSS 层消费，约 1s 后自动复位） */
  happy: boolean;
  /** 间歇小跳状态（CSS 层消费，约 0.9s 后自动复位） */
  hopping: boolean;
  /** 触发一次开心反馈（眯眼 + 弹跳 + 踢腿），并调用用户回调 */
  click: () => void;
};

export type MascotRigOptions = {
  /** 是否让眼睛/身体跟随光标，默认 true */
  followCursor?: boolean;
  /** 光标距中心多少 px 达到满偏移（横），默认 200 */
  gazeRadiusX?: number;
  /** 光标距中心多少 px 达到满偏移（纵），默认 160 */
  gazeRadiusY?: number;
  /** 间歇小跳的间隔区间（秒），默认 [6, 13]；传 null 关闭小跳 */
  hopInterval?: [number, number] | null;
  /** 点击开心反馈的持续时间（ms），默认 950 */
  happyDuration?: number;
  /** 点击回调 */
  onMascotClick?: () => void;
};

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

const DEFAULT_PUPIL_SPEC: PupilSpec = { maxX: 8, maxY: 6 };

/**
 * 共享动效核心：眼神跟随（rAF 平滑 + 瞳孔/脸/身子三档响应）、
 * 随机眨眼（偶发双眨）、间歇小跳、点击开心反馈。
 *
 * 用法（角色组件内部）：把瞳孔/眼睛/脸的元素用 register* 挂进来，
 * 动效即白送；rig 只通过 DOM class / transform 驱动，不触发 React 重渲染（除低频状态）。
 */
export function useMascotRig(options: MascotRigOptions = {}) {
  const {
    followCursor = true,
    gazeRadiusX = 200,
    gazeRadiusY = 160,
    hopInterval = [6, 13],
    happyDuration = 950,
    onMascotClick,
  } = options;

  const rootRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<RegisteredPupil[]>([]);
  const eyesRef = useRef<SVGElement[]>([]);
  const faceRef = useRef<SVGGElement | null>(null);
  const [happy, setHappy] = useState(false);
  const [hopping, setHopping] = useState(false);

  /* 配置存 ref：effect 只挂载一次，每次渲染读最新配置，避免数组字面量触发重跑 */
  const optsRef = useRef({ followCursor, gazeRadiusX, gazeRadiusY, hopInterval });
  optsRef.current = { followCursor, gazeRadiusX, gazeRadiusY, hopInterval };

  const registerPupil = useCallback((el: SVGGElement | null, spec?: PupilSpec) => {
    const next = spec ?? DEFAULT_PUPIL_SPEC;
    if (!el) {
      pupilsRef.current = pupilsRef.current.filter((p) => p.el !== el);
      return;
    }
    const existing = pupilsRef.current.findIndex((p) => p.el === el);
    if (existing >= 0) pupilsRef.current[existing] = { el, spec: next };
    else pupilsRef.current.push({ el, spec: next });
  }, []);

  const registerEye = useCallback((el: SVGElement | null) => {
    if (!el) {
      eyesRef.current = eyesRef.current.filter((e) => e !== el);
      return;
    }
    if (!eyesRef.current.includes(el)) eyesRef.current.push(el);
  }, []);

  const registerFace = useCallback((el: SVGGElement | null) => {
    faceRef.current = el;
  }, []);

  useEffect(() => {
    const { followCursor, gazeRadiusX, gazeRadiusY, hopInterval } = optsRef.current;
    const root = rootRef.current;
    const rig = rigRef.current;
    if (!root || !rig) return;

    let raf = 0;
    let rect = root.getBoundingClientRect();
    let rectAt = performance.now();
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - rectAt > 250) {
        rect = root.getBoundingClientRect();
        rectAt = now;
      }
      targetX = clamp((event.clientX - (rect.left + rect.width / 2)) / gazeRadiusX, -1, 1);
      targetY = clamp((event.clientY - (rect.top + rect.height / 2)) / gazeRadiusY, -1, 1);
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const refreshRect = () => {
      rect = root.getBoundingClientRect();
      rectAt = performance.now();
    };

    const tick = () => {
      curX += (targetX - curX) * 0.2;
      curY += (targetY - curY) * 0.2;
      /* 瞳孔位移：按每个瞳孔自己声明的最大偏移量 */
      for (const { el, spec } of pupilsRef.current) {
        el.setAttribute(
          "transform",
          `translate(${(curX * spec.maxX).toFixed(2)} ${(curY * spec.maxY).toFixed(2)})`,
        );
      }
      /* 脸随视线微转（绕脸中心） */
      if (faceRef.current) {
        faceRef.current.setAttribute("transform", `rotate(${(curX * 3).toFixed(2)} 50 52)`);
      }
      /* 身子朝光标方向侧倾 + 平移，脚留在原地，像在探身张望 */
      rig.style.transform = `rotate(${(curX * 5).toFixed(2)}deg) translate3d(${(curX * 4).toFixed(1)}px, ${(curY * 2.5).toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    if (followCursor) {
      raf = requestAnimationFrame(tick);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("resize", refreshRect, { passive: true });
      window.addEventListener("scroll", refreshRect, { passive: true });
    }

    /* 随机眨眼（偶发双眨） */
    let blinkTimer = 0;
    let phaseTimer = 0;
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        eyesRef.current.forEach((eye) => eye.classList.add("is-blinking"));
        phaseTimer = window.setTimeout(() => {
          eyesRef.current.forEach((eye) => eye.classList.remove("is-blinking"));
          if (Math.random() < 0.18) {
            phaseTimer = window.setTimeout(() => {
              eyesRef.current.forEach((eye) => eye.classList.add("is-blinking"));
              phaseTimer = window.setTimeout(() => {
                eyesRef.current.forEach((eye) => eye.classList.remove("is-blinking"));
                scheduleBlink();
              }, 90);
            }, 160);
          } else {
            scheduleBlink();
          }
        }, 110);
      }, 2200 + Math.random() * 2600);
    };
    scheduleBlink();

    /* 间歇小跳 */
    let hopTimer = 0;
    let hopResetTimer = 0;
    const scheduleHop = () => {
      if (!hopInterval) return;
      hopTimer = window.setTimeout(() => {
        setHopping(true);
        hopResetTimer = window.setTimeout(() => {
          setHopping(false);
          scheduleHop();
        }, 900);
      }, hopInterval[0] * 1000 + Math.random() * (hopInterval[1] - hopInterval[0]) * 1000);
    };
    scheduleHop();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(phaseTimer);
      window.clearTimeout(hopTimer);
      window.clearTimeout(hopResetTimer);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect);
    };
  }, []);

  /* 点击：开心眯眼 + 果冻弹跳 + 踢腿，约 1s 后恢复 */
  const click = useCallback(() => {
    onMascotClick?.();
    setHappy(true);
    window.setTimeout(() => setHappy(false), happyDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [happyDuration]);

  return {
    rootRef,
    rigRef,
    registerPupil,
    registerEye,
    registerFace,
    happy,
    hopping,
    click,
  } satisfies RigApi & {
    rootRef: React.RefObject<HTMLDivElement | null>;
    rigRef: React.RefObject<HTMLDivElement | null>;
  };
}
