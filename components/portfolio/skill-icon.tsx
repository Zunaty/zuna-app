import { skillIconMap } from "@/lib/data/skill-icons";

type SkillIconProps = {
  skill: string;
  className?: string;
};

export function SkillIcon({ skill, className = "h-3.5 w-3.5 shrink-0 opacity-80" }: SkillIconProps) {
  const iconDef = skillIconMap[skill];

  if (!iconDef) {
    return null;
  }

  if (iconDef.kind === "generic") {
    const Icon = iconDef.icon;
    return <Icon className={className} aria-hidden />;
  }

  return (
    <svg role="img" viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d={iconDef.icon.path} fill="currentColor" />
    </svg>
  );
}
