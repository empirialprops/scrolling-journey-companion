export interface RideMotion {
  position: number;
  velocity: number;
}

/** Substepped spring keeps scroll inertia consistent across frame rates. */
export function advanceRide(motion: RideMotion, target: number, delta: number): void {
  const duration = Math.min(Math.max(delta, 0), 0.05);
  const steps = Math.max(1, Math.ceil(duration / (1 / 120)));
  const dt = duration / steps;
  for (let i = 0; i < steps; i++) {
    motion.velocity += (target - motion.position) * 55 * dt;
    motion.velocity *= Math.exp(-8 * dt);
    motion.position += motion.velocity * dt;
    if (motion.position < 0 || motion.position > 1) {
      motion.position = Math.max(0, Math.min(1, motion.position));
      motion.velocity = 0;
    }
  }
}