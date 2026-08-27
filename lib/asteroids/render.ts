import { FIELD_HEIGHT, FIELD_WIDTH, SHIP_RADIUS } from "@/lib/asteroids/constants";
import type { AsteroidsState, Projectile, Rock, Ship } from "@/lib/asteroids/types";

const BACKGROUND_COLOR = "#070b14";
const SHIP_COLOR = "#e2e8f0";
const THRUST_COLOR = "#7dd3fc";
const ROCK_COLOR = "#94a3b8";
const BULLET_COLOR = "#e0f2fe";

type RenderOptions = {
  reducedMotion: boolean;
};

function drawWrapped(pos: { x: number; y: number }, radius: number, draw: (x: number, y: number) => void): void {
  const copiesX = pos.x < radius ? -1 : pos.x > FIELD_WIDTH - radius ? 1 : 0;
  const copiesY = pos.y < radius ? -1 : pos.y > FIELD_HEIGHT - radius ? 1 : 0;
  const offsetsX = copiesX === 0 ? [0] : [0, copiesX * FIELD_WIDTH];
  const offsetsY = copiesY === 0 ? [0] : [0, copiesY * FIELD_HEIGHT];

  for (const ox of offsetsX) {
    for (const oy of offsetsY) {
      draw(pos.x + ox, pos.y + oy);
    }
  }
}

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, reducedMotion: boolean): void {
  const blink = !reducedMotion && ship.iFrames > 0 && Math.floor(ship.iFrames * 10) % 2 === 0;
  if (blink) {
    return;
  }

  drawWrapped(ship.pos, SHIP_RADIUS * 1.3, (x, y) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = SHIP_COLOR;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";
    ctx.globalAlpha = ship.iFrames > 0 ? 0.55 : 1;

    ctx.beginPath();
    ctx.moveTo(SHIP_RADIUS, 0);
    ctx.lineTo(-SHIP_RADIUS * 0.72, SHIP_RADIUS * 0.62);
    ctx.lineTo(-SHIP_RADIUS * 0.45, 0);
    ctx.lineTo(-SHIP_RADIUS * 0.72, -SHIP_RADIUS * 0.62);
    ctx.closePath();
    ctx.stroke();

    if (ship.thrusting) {
      ctx.strokeStyle = THRUST_COLOR;
      ctx.beginPath();
      ctx.moveTo(-SHIP_RADIUS * 0.5, SHIP_RADIUS * 0.28);
      ctx.lineTo(-SHIP_RADIUS * 1.15, 0);
      ctx.lineTo(-SHIP_RADIUS * 0.5, -SHIP_RADIUS * 0.28);
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawRock(ctx: CanvasRenderingContext2D, rock: Rock): void {
  const path = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rock.angle);
    ctx.beginPath();
    rock.vertices.forEach((vertex, index) => {
      if (index === 0) {
        ctx.moveTo(vertex.x, vertex.y);
      } else {
        ctx.lineTo(vertex.x, vertex.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  ctx.strokeStyle = ROCK_COLOR;
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  drawWrapped(rock.pos, rock.radius, path);
}

function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
  drawWrapped(projectile.pos, projectile.radius + 1, (x, y) => {
    ctx.beginPath();
    ctx.fillStyle = BULLET_COLOR;
    ctx.arc(x, y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function renderAsteroids(ctx: CanvasRenderingContext2D, state: AsteroidsState, options: RenderOptions): void {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(-8, -8, FIELD_WIDTH + 16, FIELD_HEIGHT + 16);

  for (const rock of state.rocks) {
    drawRock(ctx, rock);
  }

  for (const projectile of state.projectiles) {
    drawProjectile(ctx, projectile);
  }

  if (state.phase !== "game-over") {
    drawShip(ctx, state.ship, options.reducedMotion);
  }
}
