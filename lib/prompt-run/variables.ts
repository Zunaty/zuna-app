export const VARIABLE_BANKS: Record<string, readonly string[]> = {
  descriptors: [
    "ethereal",
    "weathered",
    "luminous",
    "tiny",
    "colossal",
    "melancholic",
    "chaotic",
    "serene",
    "ancient",
    "futuristic",
  ],
  subjects: [
    "astronaut",
    "dragon",
    "lighthouse",
    "violinist",
    "robot",
    "fox",
    "cathedral",
    "submarine",
    "samurai",
    "garden",
  ],
  actions: [
    "dancing",
    "floating",
    "reading",
    "painting",
    "running",
    "meditating",
    "exploding",
    "whispering",
    "building",
    "dreaming",
  ],
  styles: [
    "oil painting",
    "pixel art",
    "watercolor",
    "comic book",
    "ukiyo-e",
    "surrealism",
    "art deco",
    "low poly",
    "noir",
    "impressionist",
  ],
  backgrounds: [
    "stormy ocean",
    "neon city",
    "misty forest",
    "desert dusk",
    "space station",
    "candlelit library",
    "rainy alley",
    "sunflower field",
    "arctic tundra",
    "floating islands",
  ],
  colors: [
    "teal and gold",
    "crimson and black",
    "pastel pink",
    "monochrome",
    "electric blue",
    "earth tones",
    "violet haze",
    "sunset orange",
    "silver and emerald",
    "sepia",
  ],
};

export function getWordsForCategory(category: string): readonly string[] {
  return VARIABLE_BANKS[category] ?? [];
}

export function pickRandomWords(category: string, count: number, random: () => number): string[] {
  const pool = [...getWordsForCategory(category)];
  if (pool.length === 0) {
    return [];
  }

  const picked: string[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}
