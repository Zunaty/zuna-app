export const POKEMON_FAVORITES_STORAGE_KEY = "zuna-pokemon-favorites";

export type PokemonFavorite = {
  id: number;
  name: string;
};

export function parseFavorites(raw: string | null): PokemonFavorite[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "name" in item &&
        typeof item.id === "number" &&
        typeof item.name === "string" &&
        Number.isInteger(item.id) &&
        item.id > 0
      ) {
        return [{ id: item.id, name: item.name }];
      }
      return [];
    });
  } catch {
    return [];
  }
}
