"use server";

import { revalidatePath } from "next/cache";

import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { hasAnyCollectionFlag } from "@/lib/pokemon/collection";
import { createClient } from "@/lib/supabase/server";

export type PokemonCollectionActionState = {
  error?: string;
};

export type PokemonCollectionUpdate = {
  isFavorite?: boolean;
  caughtInGame?: boolean;
  hasCard?: boolean;
};

export async function updatePokemonCollection(
  pokemonId: number,
  pokemonSlug: string,
  updates: PokemonCollectionUpdate,
): Promise<PokemonCollectionActionState & { entry: PokemonCollectionEntry | null }> {
  if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
    return { error: "Invalid Pokémon.", entry: null };
  }

  if (!pokemonSlug.trim()) {
    return { error: "Invalid Pokémon.", entry: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save your collection.", entry: null };
  }

  const { data: existing } = await supabase
    .from("pokemon_collection")
    .select("is_favorite, caught_in_game, has_card")
    .eq("user_id", user.id)
    .eq("pokemon_id", pokemonId)
    .maybeSingle();

  const nextEntry: PokemonCollectionEntry = {
    pokemonId,
    pokemonSlug,
    isFavorite: updates.isFavorite ?? existing?.is_favorite ?? false,
    caughtInGame: updates.caughtInGame ?? existing?.caught_in_game ?? false,
    hasCard: updates.hasCard ?? existing?.has_card ?? false,
  };

  if (!hasAnyCollectionFlag(nextEntry)) {
    const { error } = await supabase
      .from("pokemon_collection")
      .delete()
      .eq("user_id", user.id)
      .eq("pokemon_id", pokemonId);

    if (error) {
      return { error: error.message, entry: null };
    }

    revalidatePath("/explore/pokemon");
    revalidatePath(`/explore/pokemon/${pokemonId}`);
    return { entry: null };
  }

  const { error } = await supabase.from("pokemon_collection").upsert(
    {
      user_id: user.id,
      pokemon_id: pokemonId,
      pokemon_slug: pokemonSlug,
      is_favorite: nextEntry.isFavorite,
      caught_in_game: nextEntry.caughtInGame,
      has_card: nextEntry.hasCard,
    },
    { onConflict: "user_id,pokemon_id" },
  );

  if (error) {
    return { error: error.message, entry: null };
  }

  revalidatePath("/explore/pokemon");
  revalidatePath(`/explore/pokemon/${pokemonId}`);
  return { entry: nextEntry };
}

export async function syncLocalFavoritesToAccount(
  favorites: Array<{ id: number; name: string }>,
): Promise<PokemonCollectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || favorites.length === 0) {
    return {};
  }

  const rows = [];

  for (const favorite of favorites) {
    const { data: existing } = await supabase
      .from("pokemon_collection")
      .select("caught_in_game, has_card")
      .eq("user_id", user.id)
      .eq("pokemon_id", favorite.id)
      .maybeSingle();

    rows.push({
      user_id: user.id,
      pokemon_id: favorite.id,
      pokemon_slug: favorite.name.toLowerCase().replace(/\s+/g, "-"),
      is_favorite: true,
      caught_in_game: existing?.caught_in_game ?? false,
      has_card: existing?.has_card ?? false,
    });
  }

  const { error } = await supabase.from("pokemon_collection").upsert(rows, {
    onConflict: "user_id,pokemon_id",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/explore/pokemon");
  return {};
}
