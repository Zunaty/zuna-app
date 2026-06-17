import { createBrowserClient } from "@supabase/ssr";

import { hasSupabasePublicEnv, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

export function createClient() {
  if (!hasSupabasePublicEnv) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    );
  }

  return createBrowserClient<Database>(supabaseUrl!, supabasePublishableKey!);
}
