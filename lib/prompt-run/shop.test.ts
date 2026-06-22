import { describe, expect, it } from "vitest";

import { calculateShopItemPrice, generateShopItems } from "@/lib/prompt-run/shop";

describe("calculateShopItemPrice", () => {
  it("adds base rare price to variable points", () => {
    expect(calculateShopItemPrice("rare", 75)).toBe(275);
  });

  it("uses higher base for legendary", () => {
    expect(calculateShopItemPrice("legendary", 250)).toBe(650);
  });
});

describe("generateShopItems", () => {
  it("returns two variable items and one buff", () => {
    let seed = 0;
    const random = () => {
      seed += 0.17;
      return seed % 1;
    };

    const items = generateShopItems(["subjects", "styles"], random);
    expect(items).toHaveLength(3);
    expect(items.filter((item) => item.type === "variable")).toHaveLength(2);
    expect(items.filter((item) => item.type === "buff")).toHaveLength(1);
  });
});
