import { getPromptKind, TYPE_RACER_WORD_COUNT, type TypeRacerMode } from "@/lib/type-racer/constants";
import { TYPE_RACER_PARAGRAPHS } from "@/lib/type-racer/paragraphs";
import { TYPE_RACER_SENTENCES } from "@/lib/type-racer/sentences";
import { TYPE_RACER_WORDS } from "@/lib/type-racer/words";

function pickRandom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? items[0];
}

export function generateWordPrompt(wordCount = TYPE_RACER_WORD_COUNT): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const index = Math.floor(Math.random() * TYPE_RACER_WORDS.length);
    words.push(TYPE_RACER_WORDS[index] ?? "the");
  }

  return words.join(" ");
}

export function generatePrompt(mode: TypeRacerMode): string {
  switch (getPromptKind(mode)) {
    case "words":
      return generateWordPrompt();
    case "sentence":
      return pickRandom(TYPE_RACER_SENTENCES);
    case "paragraph":
      return pickRandom(TYPE_RACER_PARAGRAPHS);
  }
}
