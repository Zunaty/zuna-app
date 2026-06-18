import { SkillIcon } from "@/components/portfolio/skill-icon";
import { skillGroups } from "@/lib/data/skills";

export function SkillsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {skillGroups.map((group) => (
        <div key={group.title} className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold">{group.title}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                <SkillIcon skill={skill} />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
