export type PlaygroundGameId = "type-racer" | "prompt-run" | "breakout" | "asteroids" | "style-lab";

export type PlaygroundGame = {
  id: PlaygroundGameId;
  title: string;
  description: string;
  href: string;
  status: "live" | "coming-soon";
  featured: boolean;
  eyebrow?: string;
  ctaLabel?: string;
};

export const playgroundGames: PlaygroundGame[] = [
  {
    id: "type-racer",
    title: "Type Racer",
    description: "Timed typing tests — random words, sentences, or paragraphs with WPM and accuracy scoring.",
    href: "/playground/type-racer",
    status: "live",
    featured: false,
  },
  {
    id: "prompt-run",
    title: "Prompt Run",
    description: "Roguelike prompt builder — draft categories, shop for buffs, then generate art from your run.",
    href: "/playground/prompt-run",
    status: "live",
    featured: true,
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Retro brick breaker on canvas — classic levels, or draft boons and curses in Roguelite mode.",
    href: "/playground/breakout",
    status: "live",
    featured: false,
  },
  {
    id: "asteroids",
    title: "Asteroids",
    description: "Wrap-around arena shooter — rotate, thrust, and split the rocks across eight Classic waves.",
    href: "/playground/asteroids",
    status: "live",
    featured: true,
  },
  {
    id: "style-lab",
    title: "Style Lab",
    description: "Restyle the whole site — presets plus knobs for radius, accent color, and fonts.",
    href: "/playground/style-lab",
    status: "live",
    featured: true,
    eyebrow: "Experiment",
    ctaLabel: "Open",
  },
];

const featuredHomeOrder: PlaygroundGameId[] = ["style-lab", "asteroids", "prompt-run"];

export function getFeaturedPlaygroundGames(): PlaygroundGame[] {
  return playgroundGames
    .filter((game) => game.featured)
    .sort((a, b) => featuredHomeOrder.indexOf(a.id) - featuredHomeOrder.indexOf(b.id));
}
