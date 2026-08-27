import { BASE_FIRE_RATE, BULLET_RADIUS, MUZZLE_SPEED, SHIP_THRUST } from "@/lib/asteroids/constants";
import type { Delivery, Payload } from "@/lib/asteroids/types";

export type AsteroidsModifierId =
  | "thick-bullets"
  | "dumb-missiles"
  | "seeker-missiles"
  | "split-fuse"
  | "blast-fuse"
  | "cluster-size"
  | "blast-radius"
  | "rapid-fire"
  | "thrusters"
  | "extra-life"
  | "swarm"
  | "giants"
  | "gravel"
  | "shooting-stars";

export type AsteroidsRunConfig = {
  delivery: Delivery;
  payload: Payload;
  childCount: number;
  blastRadius: number;
  fireRate: number;
  thrust: number;
  scoreMult: number;
  rockCountMult: number;
  rockSizeBias: number;
  starSpawns: boolean;
  projectileRadius: number;
  projectileSpeed: number;
};

const BASE_CONFIG: AsteroidsRunConfig = {
  delivery: "bullet",
  payload: "impact",
  childCount: 3,
  blastRadius: 48,
  fireRate: BASE_FIRE_RATE,
  thrust: SHIP_THRUST,
  scoreMult: 1,
  rockCountMult: 1,
  rockSizeBias: 0,
  starSpawns: false,
  projectileRadius: BULLET_RADIUS,
  projectileSpeed: MUZZLE_SPEED,
};

/**
 * Fold picked modifiers into a derived run config. Classic always passes `[]`
 * and gets the base gun. Roguelite apply transforms land here later.
 */
export function deriveRunConfig(_modifiers: AsteroidsModifierId[]): AsteroidsRunConfig {
  return BASE_CONFIG;
}
