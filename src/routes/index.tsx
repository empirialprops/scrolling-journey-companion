import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Code2, Layers3, Box, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RideScene } from '@/components/RideScene';
import { KineticLayer } from '@/components/KineticLayer';
import { IntroGate } from '@/components/IntroGate';
import { journeyProgress, specialties, type Specialty } from '@/lib/journey';
import { useCinematicScroll } from '@/hooks/use-cinematic-scroll';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Victus — Developer. Builder. All-rounder.' },
    { name: 'description', content: 'Explore the world of Victus: full-stack development, frontend experiences, backend systems, and Minecraft servers.' },
    { property: 'og:title', content: 'Victus — Developer. Builder. All-rounder.' },
    { property: 'og:description', content: 'A 3D journey through full-stack development and Minecraft worlds.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Portfolio,
});

const capabilities = [
  { icon: Code2, title: 'Frontend', description: 'Interfaces with personality. From the first interaction to the smallest detail.' },
  { icon: Layers3, title: 'Backend', description: 'The logic behind the experience. APIs, databases, and systems built to connect.' },
  { icon: Box, title: 'Minecraft', description: 'Beyond the blocks. Custom plugins, server setups, and entirely new experiences.' },
];
function Portfolio() {
  const progress = useRef(0);
  const main = useRef<HTMLElement>(null);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const selected = specialties.find(item => item.id === specialty);
  const chapters = specialty ? ['intro', 'about', 'work', 'journey', 'contact'] : ['intro', 'about', 'work'];
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [mode, setMode] = useState<'static' | 'kinetic' | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  useCinematicScroll(main, reduced, specialty);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {};
    preference.addEventListener('change', change);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const gate = document.getElementById('work')?.offsetTop ?? max;
      progress.current = journeyProgress(window.scrollY, gate, max, specialty);
      let chapter = 0;
      chapters.forEach((id, i) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * .55) chapter = i; });
      setActive(chapter);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); preference.removeEventListener('change', change); };
  }, [specialty]);
  useEffect(() => {
    if (!specialty) return;
    const frame = requestAnimationFrame(() => {
      const next = document.getElementById('journey');
      next?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      next?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [specialty]);
  return <>
    <RideScene progress={progress} reduced={reduced} specialty={specialty} />
    {!reduced && mode && <KineticLayer />}
    {!mode && <IntroGate onPick={m => { setMode(m); setReduced(m === 'static'); window.scrollTo(0, 0); }} />}
    <div className="coordinates">INDEPENDENT DEVELOPER — DIGITAL EXPLORER</div>
    <div className="chapter-rail">{chapters.map((id, i) => <a key={id} href={`#${id}`} className={active === i ? 'active' : ''} aria-label={`Go to ${id}`} aria-current={active === i ? 'location' : undefined} />)}</div>
    <main className={`portfolio ${reduced ? 'motion-reduced' : ''}`} ref={main}>
      <header className="site-header">
        <a href="#intro" className="brand" aria-label="Victus home"><span className="brand-mark">V</span>VICTUS<span className="text-primary">.</span></a>
        <nav aria-label="Main navigation"><a href="#about" className="nav-link nav-about">About</a><a href="#work" className="nav-link">Choose a world</a><a href={specialty ? '#contact' : '#work'} className="nav-contact">Let's talk <ArrowUpRight size={15} /></a></nav>
      </header>
      <section id="intro" className="hero">
        <p className="eyebrow"><span className="status-dot" /> FULL STACK. FULL CREATIVE FREEDOM.</p>
        <h1 className="hero-title" data-pop="260">VICTUS<span>.</span></h1>
        <h2 className="hero-subtitle" data-pop="140">DEVELOPER. BUILDER.<br />A LITTLE BIT OF EVERYTHING.</h2>
        <p className="hero-copy">Frontend to backend. Websites to Minecraft worlds.<br />I turn ideas into things you can actually experience.</p>
        <div className="hero-actions"><Button asChild className="ride-button"><a href="#about">Enter my world <ArrowDownRight /></a></Button><a href="#work" className="text-action">Explore my craft <ArrowUpRight size={15} /></a></div>
        <p className="hero-note"><span>NOT JUST ANOTHER DEVELOPER.</span>Different languages.<br />Different worlds.<br />One relentless curiosity.</p>
        <div className="hero-bottom"><a href="#about" className="scroll-label"><ArrowDown size={14} /> THE JOURNEY CONTINUES</a><p className="chapter-label"><strong>01 / 04</strong> THE INTRODUCTION</p></div>
      </section>
      <section id="about" className="section about-section">
        <div className="section-heading"><span>01 — THE MINDSET</span><span>CURIOUS BY DEFAULT</span></div>
        <div className="about-layout"><h2 className="section-title" data-pop="320">NO BOX.<br />JUST <em>POSSIBILITIES.</em></h2><p className="about-copy" data-pop="180">I don't stop at the surface. I build the interface, wire the logic, and make the whole thing work.<br /><br /><strong>One developer. The entire stack.</strong></p></div>
        <div className="capability-list">{capabilities.map(({ icon: Icon, title, description }) => <div className="capability" key={title} data-pop="210"><Icon size={24} strokeWidth={1.3} /><h3>{title}</h3><p>{description}</p></div>)}</div>
        <div className="stack-strip"><span>WEB DEVELOPMENT</span><span>↗</span><span>SERVER ENGINEERING</span><span>↗</span><span>PLUGIN DEVELOPMENT</span><span>↗</span><span>WHATEVER COMES NEXT</span></div>
      </section>
      <section className="cinematic-passage" aria-label="Worlds of Victus">
        <div className="passage-sticky"><p className="eyebrow">ONE MIND. DIFFERENT DIMENSIONS.</p><h2 data-pop="500">NOTHING<br />STAYS <em>FLAT.</em></h2><span className="passage-index">VICTUS / INTO THE UNKNOWN</span></div>
      </section>
      <section id="work" className="section choice-section">
        <div className="section-heading"><span>02 — THE CROSSROADS</span><span>THREE WORLDS. YOUR CALL.</span></div>
        <h2 className="section-title" data-pop="280">CHOOSE YOUR<br /><em>DIMENSION.</em></h2>
        <div className="path-options" aria-label="Development specialties">{specialties.map(item => <Button key={item.id} variant="ghost" className={`path-option ${specialty === item.id ? 'selected' : ''}`} aria-pressed={specialty === item.id} aria-label={`Choose ${item.label}`} onClick={() => setSpecialty(item.id)}><span className="path-number">{item.number} / WORLD</span><span className="path-symbol" aria-hidden="true">{item.symbol}</span><span className="path-label">{item.label}<ArrowUpRight /></span><span className="path-tagline">{item.tagline}</span></Button>)}</div>
      </section>
      {selected && <>
      <section id="journey" className={`branch-journey branch-${selected.id}`} tabIndex={-1} aria-label={`${selected.label} journey`}>
        <div className="branch-opening section">
          <div className="section-heading"><span>03 — {selected.label.toUpperCase()}</span><Button variant="link" asChild><a href="#work">Change dimension <ArrowUpRight /></a></Button></div>
          <p className="eyebrow branch-eyebrow">{selected.tagline}</p>
          <h2 className="section-title branch-title" data-pop="400">{selected.title.split('\n').map((line, i) => <span key={line} className={i ? 'text-primary' : ''}>{line}<br /></span>)}</h2>
          <p className="branch-description" data-pop="180">{selected.description}</p>
          <a href="#deep-dive" className="scroll-label"><ArrowDown size={14} /> INTO {selected.label.toUpperCase()}</a>
        </div>
        <div className="project-wall section"><div className="section-heading"><span>WORK — {selected.label.toUpperCase()}</span><span>{selected.projects.length} PROJECT{selected.projects.length > 1 ? 'S' : ''}</span></div><div className="project-grid">{selected.projects.map((p, i) => { const inner = <><span className="project-index">{String(i + 1).padStart(2, '0')}</span><h3>{p.name}</h3><p>{p.role}</p>{p.url && <ArrowUpRight className="project-arrow" />}</>; return p.url ? <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="project-card" style={{ animationDelay: `${i * .08}s` }}>{inner}</a> : <div key={p.name} className="project-card" style={{ animationDelay: `${i * .08}s` }}>{inner}</div>; })}</div></div>
        <div id="deep-dive" className="branch-beats">{selected.scenes.map((title, i) => <section className="journey-beat" key={title}><div className="beat-content"><span className="beat-index">{selected.number}.{i + 1} / {selected.skills[i]}</span><h3 data-pop="450">{title}</h3><span className="beat-symbol" data-pop="650" aria-hidden="true">{selected.symbol}</span></div></section>)}</div>
      </section>
      <section id="contact" className="section contact-section">
        <div className="section-heading"><span>03 — WHAT'S NEXT?</span><span>GREAT IDEAS START WITH A CONVERSATION.</span></div>
        <h2 className="section-title" data-pop="300">YOUR IDEA.<br /><em>OUR NEXT ADVENTURE.</em></h2>
        <div className="contact-row"><p>{selected.label}. Or something that doesn't have a name yet. Let's make it real.</p><Button className="contact-button" aria-label="Contact Victus" onClick={() => setContactOpen(true)}><ArrowUpRight /></Button></div>
      </section>
      </>}
      <footer className="footer"><span>© 2026 VICTUS</span><span>BUILT WITH CURIOSITY. NOT TEMPLATES.</span></footer>
    </main>
    <Button variant="ghost" size="icon" className="motion-button" onClick={() => setReduced(v => !v)} title={reduced ? 'Resume 3D motion' : 'Reduce 3D motion'} aria-label={reduced ? 'Resume 3D motion' : 'Reduce 3D motion'}>{reduced ? <Play size={14} /> : <Pause size={14} />}</Button>
    <Dialog open={contactOpen} onOpenChange={setContactOpen}><DialogContent className="contact-dialog"><DialogTitle>LET'S CONNECT.</DialogTitle><DialogDescription>Victus's contact links are on their way. Check back soon.</DialogDescription></DialogContent></Dialog>
  </>;
}
