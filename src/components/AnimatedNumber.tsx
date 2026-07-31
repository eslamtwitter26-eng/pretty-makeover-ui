import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Formats the animated value for display. */
  format?: (v: number) => string;
  /** Animation length in ms — kept short for a fast ticker feel. */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fast counting-up number that replays every time it re-enters the viewport
 * and whenever the underlying value changes (e.g. the time filter).
 */
export function AnimatedNumber({
  value,
  format = (v) => v.toFixed(2),
  duration = 700,
  className,
  style,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) {
      setDisplay(0);
      return;
    }
    let raf = 0;
    const from = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(display)}
    </span>
  );
}
