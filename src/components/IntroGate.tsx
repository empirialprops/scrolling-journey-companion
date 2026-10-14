import { useEffect, useState } from 'react';
import { specialties, type Specialty } from '@/lib/journey';

export function IntroGate({ onPick }: { onPick: (mode: 'static' | 'kinetic', world: Specialty) => void }) {
  const [load, setLoad] = useState(0);
  const [mode, setMode] = useState<'static' | 'kinetic' | null>(null);
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
  const pickWorld = (world: Specialty) => {
    if (!mode) return;
    setLeaving(true);
    setTimeout(() => onPick(mode, world), 550);
  };
  const ready = load >= 100;
  return <div className={`intro-gate ${leaving ? 'leaving' : ''}`} role="dialog" aria-label="Choose your experience">
    <h1 className="intro-logo">VICTUS<span>.</span></h1>
    {!ready ? <>
      <div className="intro-bar"><div style={{ width: `${load}%` }} /></div>
      <p className="intro-count">LOADING {Math.floor(load)}%</p>
    </> : !mode ? <>
      <p className="intro-question">HOW WOULD YOU LIKE TO EXPERIENCE IT?</p>
      <div className="intro-options">
        <button className="intro-option" onClick={() => setMode('static')}><strong>STATIC</strong><span>A clean, calm website. Just scroll and read.</span></button>
        <button className="intro-option kinetic" onClick={() => setMode('kinetic')}><strong>KINETIC</strong><span>The full 3D ride. Everything moves.</span></button>
      </div>
    </> : <>
      <p className="intro-question">NOW — CHOOSE YOUR DIMENSION.</p>
      <div className="intro-options intro-worlds">
        {specialties.map(s => <button key={s.id} className="intro-option intro-world" onClick={() => pickWorld(s.id)}>
          <span className="intro-world-symbol" aria-hidden="true">{s.symbol}</span>
          <strong>{s.label.toUpperCase()}</strong>
          <span>{s.tagline}</span>
        </button>)}
      </div>
      <button className="intro-back" onClick={() => setMode(null)}>← Back</button>
    </>}
  </div>;
}
