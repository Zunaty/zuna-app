/**
 * Presentation-only effects (particles, screen shake). Lives outside the pure
 * game state — mutated by the component that owns the render loop.
 */

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

export type JuiceState = {
  particles: Particle[];
  /** Screen shake intensity in canvas units; decays every tick. */
  shake: number;
};

export function createJuice(): JuiceState {
  return { particles: [], shake: 0 };
}

const PARTICLE_GRAVITY = 600;
const SHAKE_DECAY = 14;
const MAX_PARTICLES = 220;

export function updateJuice(juice: JuiceState, dt: number): void {
  juice.shake = Math.max(0, juice.shake - SHAKE_DECAY * dt * (juice.shake + 0.4));

  for (const particle of juice.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += PARTICLE_GRAVITY * dt;
    particle.life -= dt;
  }

  juice.particles = juice.particles.filter((particle) => particle.life > 0);
}

export function addBrickBurst(juice: JuiceState, x: number, y: number, color: string): void {
  if (juice.particles.length > MAX_PARTICLES) {
    return;
  }

  const count = 8;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 90 + Math.random() * 140;
    juice.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.6,
      size: 2 + Math.random() * 2,
      color,
    });
  }
}

export function addShake(juice: JuiceState, amount: number): void {
  juice.shake = Math.min(8, juice.shake + amount);
}
