"use client";

import { Check, Circle } from "lucide-react";

import { getPasswordRequirementResults } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
  id?: string;
  className?: string;
};

export function PasswordRequirements({ password, id = "password-requirements", className }: PasswordRequirementsProps) {
  const results = getPasswordRequirementResults(password);
  const hasInput = password.length > 0;

  return (
    <div id={id} className={cn("space-y-2", className)} aria-live="polite">
      <p className="text-sm text-muted-foreground">Password must include:</p>
      <ul className="space-y-1.5">
        {results.map((requirement) => (
          <li key={requirement.id} className="flex items-center gap-2 text-sm">
            {requirement.met ? (
              <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <Circle
                className={cn("size-4 shrink-0", hasInput ? "text-muted-foreground" : "text-muted-foreground/60")}
                aria-hidden
              />
            )}
            <span className={cn(requirement.met ? "text-foreground" : "text-muted-foreground")}>
              {requirement.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
