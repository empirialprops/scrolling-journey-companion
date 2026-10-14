import { useEffect, type RefObject } from 'react';

/** Scrub DOM depth directly, without re-rendering React on each frame. */
export function useCinematicScroll(root: RefObject<HTMLElement | null>, reduced: boolean, branch: string | null) {
  useEffect(() => {
    const elements = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-pop]') ?? []);
    let frame = 0;
    const draw = () => {
      const height = window.innerHeight;
      elements.forEach(element => {
        const anchor = element.closest('.cinematic-passage, .journey-beat') ?? element.parentElement;
        const rect = anchor?.getBoundingClientRect();
        if (!rect) return;
        const phase = Math.max(-1, Math.min(1, (rect.top + rect.height * .35 - height * .5) / height));
        const depth = Number(element.dataset['pop']) || 100;
        element.style.transform = reduced ? 'none' : `perspective(1000px) translate3d(0, ${phase * 55}px, ${(1 - Math.abs(phase)) * 90 - Math.abs(phase) * depth}px) rotateX(${phase * 9}deg)`;
        element.style.opacity = String(reduced ? 1 : Math.max(.55, 1 - Math.abs(phase) * .45));
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [root, reduced, branch]);
}