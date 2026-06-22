import { NON_VARIABLE_SHOP_ITEMS, SHOP_ITEM_COOLDOWN_ROUNDS } from "@/lib/prompt-run/constants";
import { createPromptVariable } from "@/lib/prompt-run/rarity";
import { createId } from "@/lib/prompt-run/round";
import type { Buff, PromptVariable, Rarity, ShopItem } from "@/lib/prompt-run/types";
import { pickRandomWords } from "@/lib/prompt-run/variables";

export function calculateShopItemPrice(rarity: Rarity, variablePoints: number): number {
  const basePrice = rarity === "rare" ? 200 : rarity === "epic" ? 300 : rarity === "legendary" ? 400 : 100;
  return basePrice + variablePoints;
}

export function isBuffActiveForRound(buffs: Buff[], buffName: string, roundNumber: number): boolean {
  return buffs.some((buff) => {
    if (!buff.active || buff.name !== buffName) {
      return false;
    }
    const endRound = buff.roundStart + buff.duration - 1;
    return roundNumber >= buff.roundStart && roundNumber <= endRound;
  });
}

function createShopVariable(categorySequence: readonly string[], random: () => number): PromptVariable {
  const category = categorySequence[Math.floor(random() * categorySequence.length)] ?? "subjects";
  const name = pickRandomWords(category, 1, random)[0] ?? "artifact";
  const rarityRandom = random() < 0.65 ? 0.08 : 0.02;
  let variable = {
    ...createPromptVariable(createId(), name, rarityRandom, random()),
    categoryName: category,
  };
  if (variable.rarity !== "rare" && variable.rarity !== "legendary") {
    variable = { ...variable, rarity: "rare", points: Math.max(variable.points, 50) };
  }
  return variable;
}

export function generateShopItems(categorySequence: readonly string[], random: () => number): ShopItem[] {
  const items: ShopItem[] = [];

  for (let i = 0; i < 2; i++) {
    const variable = createShopVariable(categorySequence, random);
    items.push({
      id: `${variable.id}-${Date.now()}-${i}`,
      name: variable.name,
      rarity: variable.rarity,
      price: calculateShopItemPrice(variable.rarity, variable.points),
      type: "variable",
      variable,
      isOnCooldown: false,
      cooldownEndRound: null,
    });
  }

  const buffTemplate = NON_VARIABLE_SHOP_ITEMS[Math.floor(random() * NON_VARIABLE_SHOP_ITEMS.length)];
  if (buffTemplate) {
    items.push({
      ...buffTemplate,
      id: createId(),
      isOnCooldown: false,
      cooldownEndRound: null,
    });
  }

  return items;
}

export function prepareShopItemsForRound(
  currentItems: ShopItem[],
  completedRounds: number,
  categorySequence: readonly string[],
  random: () => number,
): ShopItem[] {
  if (currentItems.length === 0) {
    return generateShopItems(categorySequence, random);
  }

  return currentItems.map((item) => {
    const cooldownEnd = item.cooldownEndRound ?? null;
    if (item.isOnCooldown && cooldownEnd !== null && completedRounds >= cooldownEnd) {
      const [replacement] = generateShopItems(categorySequence, random);
      return replacement ?? { ...item, isOnCooldown: false, cooldownEndRound: null };
    }
    return item;
  });
}

export function getRerollChargeAmount(itemName: string): number {
  if (itemName.includes("x5")) {
    return 5;
  }
  if (itemName.includes("x3")) {
    return 3;
  }
  return 1;
}

export { SHOP_ITEM_COOLDOWN_ROUNDS };
