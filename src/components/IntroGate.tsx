import { useEffect, useState } from 'react';

export function IntroGate({ onPick }: { onPick: (mode: 'static' | 'kinetic') => void }) {
  const [load, setLoad] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(100, ((performance.now() - start) / 2200) * 100);
      setLoad(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pick = (m: 'static' | 'kinetic') => { setLeaving(true); setTimeout(() => onPick(m), 550); };
  const ready = load >= 100;
  return <div className={`intro-gate ${leaving ? 'leaving' : ''}`} role="dialog" aria-label="Choose your experience">
    <h1 className="intro-logo">VICTUS<span>.</span></h1>
    {!ready ? <>
      <div className="intro-bar"><div style={{ width: `${load}%` }} /></div>
      <p className="intro-count">LOADING {Math.floor(load)}%</p>
    </> : <>
      <p className="intro-question">HOW WOULD YOU LIKE TO EXPERIENCE IT?</p>
      <div className="intro-options">
        <button className="intro-option" onClick={() => pick('static')}><strong>STATIC</strong><span>A clean, calm website. Just scroll and read.</span></button>
        <button className="intro-option kinetic" onClick={() => pick('kinetic')}><strong>KINETIC</strong><span>The full 3D ride. Everything moves.</span></button>
      </div>
    </>}
  </div>;
}
