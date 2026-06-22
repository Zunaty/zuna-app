"use client";

import { LayoutGroup, m } from "framer-motion";
import { ArrowDownAZ, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import { SkillIcon } from "@/components/portfolio/skill-icon";
import { Button } from "@/components/ui/button";
import { skillGroups } from "@/lib/data/skills";
import { instantTransition, motionTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

type SkillGroup = {
  readonly title: string;
  readonly skills: readonly string[];
};

type SkillEntry = {
  skill: string;
  category: string;
};

type SkillsGridProps = {
  staggerKey?: string;
  groups?: readonly SkillGroup[];
};

type CategoryColorSet = {
  pill: string;
  filterActive: string;
};

const skillCategoryColors: CategoryColorSet[] = [
  {
    pill: "border-violet-500/45 bg-violet-500/15 text-violet-900 dark:text-violet-100",
    filterActive: "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500",
  },
  {
    pill: "border-emerald-500/45 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
    filterActive: "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500",
  },
  {
    pill: "border-amber-500/45 bg-amber-500/15 text-amber-900 dark:text-amber-100",
    filterActive: "border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500",
  },
  {
    pill: "border-sky-500/45 bg-sky-500/15 text-sky-900 dark:text-sky-100",
    filterActive: "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500",
  },
  {
    pill: "border-rose-500/45 bg-rose-500/15 text-rose-900 dark:text-rose-100",
    filterActive: "border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500",
  },
  {
    pill: "border-orange-500/45 bg-orange-500/15 text-orange-900 dark:text-orange-100",
    filterActive: "border-orange-600 bg-orange-600 text-white dark:border-orange-500 dark:bg-orange-500",
  },
];

function getCategoryColors(groups: readonly SkillGroup[], category: string): CategoryColorSet {
  const index = groups.findIndex((group) => group.title === category);
  const safeIndex = index >= 0 ? index : 0;

  return skillCategoryColors[safeIndex % skillCategoryColors.length];
}

function flattenSkills(groups: readonly SkillGroup[]): SkillEntry[] {
  return groups.flatMap((group) => group.skills.map((skill) => ({ skill, category: group.title })));
}

function sortAlphabetically(skills: SkillEntry[]): SkillEntry[] {
  return [...skills].sort((a, b) => a.skill.localeCompare(b.skill));
}

function shuffleSkills(skills: SkillEntry[]): SkillEntry[] {
  const next = [...skills];

  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

function getGroupsKey(groups: readonly SkillGroup[]): string {
  return groups.map((group) => `${group.title}:${group.skills.join(",")}`).join("|");
}

type ShuffleState = {
  groupsKey: string;
  order: SkillEntry[];
};

export function SkillsGrid({ staggerKey = "skills-grid", groups = skillGroups }: SkillsGridProps) {
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const groupsKey = useMemo(() => getGroupsKey(groups), [groups]);
  const sortedSkills = useMemo(() => sortAlphabetically(flattenSkills(groups)), [groups]);
  const [shuffleState, setShuffleState] = useState<ShuffleState | null>(null);

  const isShuffled = shuffleState?.groupsKey === groupsKey;
  const orderedSkills = isShuffled ? shuffleState.order : sortedSkills;

  const handleFilterClick = (title: string) => {
    setActiveCategory((current) => (current === title ? null : title));
  };

  const handleShuffle = () => {
    setShuffleState((current) => ({
      groupsKey,
      order: shuffleSkills(current?.groupsKey === groupsKey ? current.order : sortedSkills),
    }));
  };

  const handleSortAlphabetically = () => {
    setShuffleState(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Filter by</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter skills by category">
            {groups.map((group, index) => {
              const isActive = activeCategory === group.title;
              const colors = skillCategoryColors[index % skillCategoryColors.length];

              return (
                <button
                  key={group.title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFilterClick(group.title)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-200",
                    activeCategory !== null && isActive
                      ? colors.filterActive
                      : "border-border bg-background text-foreground hover:border-foreground/40",
                  )}
                >
                  {group.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          {isShuffled ? (
            <Button variant="outline" size="sm" onClick={handleSortAlphabetically} aria-label="Sort skills A to Z">
              <ArrowDownAZ className="h-4 w-4" aria-hidden />
              A–Z
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={handleShuffle} aria-label="Shuffle skill order">
            <Shuffle className="h-4 w-4" aria-hidden />
            Shuffle
          </Button>
        </div>
      </div>

      <LayoutGroup id={staggerKey}>
        <m.ul className="flex flex-wrap gap-2" layout>
          {orderedSkills.map(({ skill, category }) => {
            const isHighlighted = activeCategory !== null && category === activeCategory;
            const isDimmed = activeCategory !== null && category !== activeCategory;
            const colors = getCategoryColors(groups, category);

            return (
              <m.li
                key={`${category}-${skill}`}
                layout
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  layout: reduceMotion ? instantTransition : springTransition,
                  opacity: reduceMotion ? instantTransition : motionTransition,
                  y: reduceMotion ? instantTransition : motionTransition,
                }}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-[opacity,filter,background-color,border-color,color] duration-200",
                    isHighlighted ? colors.pill : "border-border bg-background text-muted-foreground",
                    isDimmed && "opacity-40 grayscale",
                  )}
                >
                  <SkillIcon skill={skill} />
                  {skill}
                </span>
              </m.li>
            );
          })}
        </m.ul>
      </LayoutGroup>
    </div>
  );
}
