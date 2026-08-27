import { BULLET_LIFETIME, MAX_PROJECTILES, SHIP_RADIUS } from "@/lib/asteroids/constants";
import type { AsteroidsRunConfig } from "@/lib/asteroids/modifiers";
import { heading } from "@/lib/asteroids/physics";
import type { Projectile, Ship } from "@/lib/asteroids/types";

export function canFire(ship: Ship, projectileCount: number): boolean {
  return ship.cooldown <= 0 && projectileCount < MAX_PROJECTILES;
}

export function spawnProjectile(ship: Ship, nextId: number, config: AsteroidsRunConfig): Projectile {
  const nose = heading(ship.angle);
  return {
    id: nextId,
    pos: {
      x: ship.pos.x + nose.x * SHIP_RADIUS,
      y: ship.pos.y + nose.y * SHIP_RADIUS,
    },
    vel: {
      x: ship.vel.x + nose.x * config.projectileSpeed,
      y: ship.vel.y + nose.y * config.projectileSpeed,
    },
    radius: config.projectileRadius,
    ttl: BULLET_LIFETIME,
    delivery: config.delivery,
    payload: config.payload,
    fuse: 0,
    isChild: false,
  };
}
