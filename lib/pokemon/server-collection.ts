import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function getUserPokemonCollection(): Promise<{
  userId: string | null;
  collection: PokemonCollectionEntry[];
}> {
  if (!hasSupabasePublicEnv) {
    return { userId: null, collection: [] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, collection: [] };
  }

  const { data, error } = await supabase
    .from("pokemon_collection")
    .select("pokemon_id, pokemon_slug, is_favorite, caught_in_game, has_card")
    .eq("user_id", user.id)
    .order("pokemon_id", { ascending: true });

  if (error) {
    return { userId: user.id, collection: [] };
  }

  const collection: PokemonCollectionEntry[] = (data ?? []).map((row) => ({
    pokemonId: row.pokemon_id,
    pokemonSlug: row.pokemon_slug,
    isFavorite: row.is_favorite,
    caughtInGame: row.caught_in_game,
    hasCard: row.has_card,
  }));

  return { userId: user.id, collection };
}
