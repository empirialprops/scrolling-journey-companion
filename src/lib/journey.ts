export type Specialty = 'web' | 'fullstack' | 'game';

export const specialties = [
  { id: 'web', label: 'Web development', number: '01', symbol: '</>', tagline: 'THE INTERFACE IS THE EXPERIENCE.', title: 'MAKE IT\nUNFORGETTABLE.', description: 'Expressive websites, thoughtful interfaces, and interactions that make every detail count.', skills: ['Frontend engineering', 'Interactive experiences', 'Responsive interfaces'], scenes: ['From a blank canvas', 'To the smallest interaction', 'To something worth exploring'] },
  { id: 'fullstack', label: 'Full stack development', number: '02', symbol: '{ }', tagline: 'EVERY LAYER. ONE VISION.', title: 'FROM PIXEL\nTO PIPELINE.', description: 'The complete picture: interfaces, APIs, data, and the systems that bring them together.', skills: ['Frontend & backend', 'APIs & databases', 'System integration'], scenes: ['The experience you see', 'The logic you don’t', 'One connected system'] },
  { id: 'game', label: 'Game development', number: '03', symbol: '▦', tagline: 'BUILD WORLDS. BREAK LIMITS.', title: 'BEYOND\nTHE BLOCKS.', description: 'Minecraft servers, custom plugins, and interactive worlds built around the people who play them.', skills: ['Minecraft servers', 'Custom plugins', 'Gameplay systems'], scenes: ['A world of possibilities', 'Rules made to be rewritten', 'Experiences built for players'] },
] as const;

export function journeyProgress(scroll: number, gate: number, end: number, specialty: Specialty | null) {
  if (scroll <= gate || specialty === null) return Math.max(0, Math.min(.55, scroll / Math.max(1, gate) * .55));
  return .55 + Math.min(1, (scroll - gate) / Math.max(1, end - gate)) * .45;
}