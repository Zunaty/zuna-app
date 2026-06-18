import { TYPE_RACER_WORD_COUNT } from "@/lib/type-racer/constants";
import { TYPE_RACER_WORDS } from "@/lib/type-racer/words";

export function generateWordPrompt(wordCount = TYPE_RACER_WORD_COUNT): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const index = Math.floor(Math.random() * TYPE_RACER_WORDS.length);
    words.push(TYPE_RACER_WORDS[index] ?? "the");
  }

  return words.join(" ");
}
