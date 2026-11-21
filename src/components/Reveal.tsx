import { useLayoutEffect, useRef, type ReactNode } from "react";
import "./Reveal.css";

type Props = {
  children: ReactNode;
  /** Selector CSS de los elementos a animar dentro del contenedor */
  selector?: string;
  /** Segundos entre un elemento y el siguiente (por posición entre hermanos) */
  step?: number;
  className?: string;
};

export function RevealAll({
  children,
  selector = "section > *",
  step = 0.1,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // useLayoutEffect: se aplica antes de pintar, para que no haya parpadeo
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal--visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    for (const el of targets) {
      const siblings = Array.from(el.parentElement?.children ?? []);
      const index = Math.min(siblings.indexOf(el), 8);
      el.style.setProperty("--reveal-delay", `${index * step}s`);
      el.classList.add("reveal");
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const el of targets) el.classList.remove("reveal", "reveal--visible");
    };
  }, [selector, step]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}