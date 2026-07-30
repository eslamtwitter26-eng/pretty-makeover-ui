import { useEffect, useRef, useState } from "react";

/**
 * Crosshair glow that tracks the pointer: two soft scanning lines plus a
 * radial bloom, all rendered from theme tokens.
 */
export function CursorGlow({
  className,
  variant = "crosshair",
  fixed = false,
}: {
  className?: string;
  /** "crosshair" = scanning lines + dot, "bloom" = soft background glow only */
  variant?: "crosshair" | "bloom";
  /** track the whole viewport instead of the parent element */
  fixed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const parent = fixed ? window : el?.parentElement;
    if (!el || !parent) return;

    let frame = 0;
    const onMove = (ev: Event) => {
      const e = ev as PointerEvent;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = fixed ? null : (parent as HTMLElement).getBoundingClientRect();
        el.style.setProperty("--cx", `${e.clientX - (rect?.left ?? 0)}px`);
        el.style.setProperty("--cy", `${e.clientY - (rect?.top ?? 0)}px`);
        setActive(true);
      });
    };
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerenter", onEnter);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [fixed]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-active={active}
      className={`cursor-glow pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-500 data-[active=true]:opacity-100 ${className ?? ""}`}
    >
      {variant === "bloom" ? (
        <>
          <div className="cursor-glow-bloom cursor-glow-bloom-wide" />
          <div className="cursor-glow-bloom cursor-glow-bloom-core" />
        </>
      ) : (
        <>
          <div className="cursor-glow-bloom" />
          <div className="cursor-glow-line cursor-glow-line-x" />
          <div className="cursor-glow-line cursor-glow-line-y" />
          <div className="cursor-glow-dot" />
        </>
      )}
    </div>
  );
}
