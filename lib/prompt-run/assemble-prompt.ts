import type { PromptVariable } from "@/lib/prompt-run/types";

export function assemblePrompt(roundVariables: PromptVariable[], shopVariables: PromptVariable[] = []): string {
  const names = [...roundVariables, ...shopVariables].map((variable) => variable.name.trim()).filter(Boolean);
  return names.join(", ");
}
