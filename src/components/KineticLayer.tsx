import { useEffect, useRef } from 'react';

/** Cursor blob, click bursts, scroll bar, magnetic hover and tilt — pure kinetic chaos. */
export function KineticLayer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0, lastY = scrollY, skew = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      document.querySelectorAll<HTMLElement>('.capability, .path-option, .ride-button, .nav-contact, .contact-button').forEach(el => {
        const r = el.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * .9;
        el.style.translate = near ? `${dx * .18}px ${dy * .18}px` : '0 0';
        el.style.rotate = near ? `${dx * .02}deg` : '0deg';
      });
    };
    const burst = (e: PointerEvent) => {
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('span');
        s.className = 'kinetic-spark';
        const a = (i / 18) * Math.PI * 2, d = 60 + Math.random() * 90;
        s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
        s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
        s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 800);
      }
    };
    const loop = () => {
      rx += (mx - rx) * .15; ry += (my - ry) * .15;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) scale(${1 + Math.min(Math.hypot(mx - rx, my - ry) / 60, 1.5)})`;
      const v = scrollY - lastY; lastY = scrollY;
      skew += (Math.max(-12, Math.min(12, v * .25)) - skew) * .12;
      document.documentElement.style.setProperty('--scroll-skew', `${skew}deg`);
      const vh = innerHeight;
      document.querySelectorAll<HTMLElement>('.portfolio > section, .portfolio > footer').forEach(el => {
        el.classList.add('zoom-layer');
        el.style.transform = '';
        const r = el.getBoundingClientRect();
        let y = 0, s = 1, o = 1, b = 0, e = 0, z = 1, rot = 0;
        if (r.top > 0) { // approaching from deep inside
          e = Math.min(r.top / vh, 1);
          y = -r.top; s = Math.max(.05, 1 - e * .95); o = 1 - e; b = e * 14; z = 1; rot = e * 25;
        } else if (r.bottom < vh) { // flying past the camera
          const x = Math.min((vh - r.bottom) / vh, 1);
          y = vh - r.bottom; s = 1 + x * x * 6; o = 1 - x * 1.1; b = x * 8; z = 2; rot = -x * 10;
        }
        const originY = vh / 2 - r.top - y;
        el.style.transformOrigin = `50% ${originY}px`;
        el.style.transform = `translateY(${y}px) scale(${s}) rotate(${rot}deg)`;
        el.style.opacity = `${Math.max(0, o)}`;
        el.style.filter = b > .2 ? `blur(${b}px)` : '';
        el.style.zIndex = `${z}`;
        el.style.pointerEvents = o < .4 ? 'none' : '';
        el.style.setProperty('--e', `${e}`);
      });
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle('in-view', en.isIntersecting)), { threshold: .15 });
    const watch = () => document.querySelectorAll('section, .capability, .path-option, .journey-beat, .footer').forEach(el => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    addEventListener('pointermove', move);
    addEventListener('pointerdown', burst);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', move); removeEventListener('pointerdown', burst); io.disconnect(); mo.disconnect(); };
  }, []);
  return <>
    <div className="kinetic-bar" ref={bar} />
    <div className="kinetic-ring" ref={ring} />
    <div className="kinetic-dot" ref={dot} />
    <div className="kinetic-marquee" aria-hidden="true"><div>{Array.from({ length: 8 }, (_, i) => <span key={i}>VICTUS ✦ BUILD ✦ BREAK ✦ MOVE ✦ </span>)}</div></div>
    <div className="kinetic-noise" aria-hidden="true" />
  </>;
}
