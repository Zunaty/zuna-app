/**
 * Public Supabase env — supports dashboard naming variants.
 * Next inlines each NEXT_PUBLIC_* reference at build time.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabasePublicEnv = Boolean(supabaseUrl && supabasePublishableKey);
