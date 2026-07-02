import {
  Compass,
  Crown,
  FileText,
  Flame,
  FolderOpen,
  Gamepad2,
  ImageIcon,
  Keyboard,
  Mail,
  Medal,
  Plane,
  ScrollText,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ACHIEVEMENT_IDS = [
  "meta-sign-up",
  "explore-about",
  "explore-projects",
  "explore-resume",
  "explore-contact",
  "explore-grand-tour",
  "skills-filter",
  "skills-shuffle",
  "type-first-run",
  "type-60-wpm",
  "type-perfect",
  "type-marathon",
  "prompt-run-first-round",
  "prompt-run-perfect",
  "prompt-run-streak-7",
  "prompt-run-generate",
  "prompt-run-high-score",
  "playground-sampler",
  "completionist",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export type AchievementCategory = "meta" | "explorer" | "type-racer" | "prompt-run";

export const ACHIEVEMENT_CATEGORY_LABEL: Record<AchievementCategory, string> = {
  meta: "Meta",
  explorer: "Explorer",
  "type-racer": "Type Racer",
  "prompt-run": "Prompt Run",
};

export type AchievementDefinition = {
  id: AchievementId;
  category: AchievementCategory;
  title: string;
  description: string;
  points: number;
  icon: LucideIcon;
  /** When set, this achievement unlocks automatically once all listed ids are unlocked. */
  requiredIds?: AchievementId[];
};

export const ACHIEVEMENTS: Record<AchievementId, AchievementDefinition> = {
  "meta-sign-up": {
    id: "meta-sign-up",
    category: "meta",
    title: "Signed up",
    description: "Create an account and start syncing progress.",
    points: 10,
    icon: UserCheck,
  },
  "explore-about": {
    id: "explore-about",
    category: "explorer",
    title: "Getting acquainted",
    description: "Visit the About page.",
    points: 5,
    icon: Plane,
  },
  "explore-projects": {
    id: "explore-projects",
    category: "explorer",
    title: "Window shopping",
    description: "Visit the Projects page.",
    points: 5,
    icon: FolderOpen,
  },
  "explore-resume": {
    id: "explore-resume",
    category: "explorer",
    title: "Doing your homework",
    description: "Visit the Resume page.",
    points: 5,
    icon: FileText,
  },
  "explore-contact": {
    id: "explore-contact",
    category: "explorer",
    title: "Say hello",
    description: "Visit the Contact page.",
    points: 5,
    icon: Mail,
  },
  "explore-grand-tour": {
    id: "explore-grand-tour",
    category: "explorer",
    title: "Grand tour",
    description: "Visit About, Projects, Resume, and Contact.",
    points: 20,
    icon: Compass,
    requiredIds: ["explore-about", "explore-projects", "explore-resume", "explore-contact"],
  },
  "skills-filter": {
    id: "skills-filter",
    category: "explorer",
    title: "Narrowing it down",
    description: "Filter the skills grid by a category.",
    points: 10,
    icon: SlidersHorizontal,
  },
  "skills-shuffle": {
    id: "skills-shuffle",
    category: "explorer",
    title: "Mix it up",
    description: "Shuffle the skills grid at least once.",
    points: 10,
    icon: Shuffle,
  },
  "type-first-run": {
    id: "type-first-run",
    category: "type-racer",
    title: "First lap",
    description: "Complete any Type Racer run.",
    points: 10,
    icon: Keyboard,
  },
  "type-60-wpm": {
    id: "type-60-wpm",
    category: "type-racer",
    title: "Speed demon",
    description: "Hit 60 WPM in a random words mode.",
    points: 25,
    icon: Timer,
  },
  "type-perfect": {
    id: "type-perfect",
    category: "type-racer",
    title: "Flawless",
    description: "Finish sentence mode with 100% accuracy.",
    points: 25,
    icon: Target,
  },
  "type-marathon": {
    id: "type-marathon",
    category: "type-racer",
    title: "Marathoner",
    description: "Finish a full paragraph before the timer runs out.",
    points: 25,
    icon: ScrollText,
  },
  "prompt-run-first-round": {
    id: "prompt-run-first-round",
    category: "prompt-run",
    title: "First round",
    description: "Complete your first Prompt Run round.",
    points: 10,
    icon: Sparkles,
  },
  "prompt-run-perfect": {
    id: "prompt-run-perfect",
    category: "prompt-run",
    title: "All legendary",
    description: "Complete a round with only legendary picks and no skips.",
    points: 50,
    icon: Trophy,
  },
  "prompt-run-streak-7": {
    id: "prompt-run-streak-7",
    category: "prompt-run",
    title: "On fire",
    description: "Reach the legendary streak tier (7 rare-or-better picks in a row).",
    points: 30,
    icon: Flame,
  },
  "prompt-run-generate": {
    id: "prompt-run-generate",
    category: "prompt-run",
    title: "Prompt artist",
    description: "Generate your first image from a finished run.",
    points: 20,
    icon: ImageIcon,
  },
  "prompt-run-high-score": {
    id: "prompt-run-high-score",
    category: "prompt-run",
    title: "New record",
    description: "Beat your personal best run score.",
    points: 15,
    icon: Medal,
  },
  "playground-sampler": {
    id: "playground-sampler",
    category: "meta",
    title: "Game hopper",
    description: "Play both Type Racer and Prompt Run.",
    points: 15,
    icon: Gamepad2,
    requiredIds: ["type-first-run", "prompt-run-first-round"],
  },
  completionist: {
    id: "completionist",
    category: "meta",
    title: "Completionist",
    description: "Unlock every other achievement.",
    points: 50,
    icon: Crown,
    requiredIds: ACHIEVEMENT_IDS.filter((id) => id !== "completionist"),
  },
};

export const ACHIEVEMENT_LIST: AchievementDefinition[] = ACHIEVEMENT_IDS.map((id) => ACHIEVEMENTS[id]);

export function isAchievementId(value: string): value is AchievementId {
  return (ACHIEVEMENT_IDS as readonly string[]).includes(value);
}
