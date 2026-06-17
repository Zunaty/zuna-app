import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasSupabasePublicEnv, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

export async function createClient() {
  if (!hasSupabasePublicEnv) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — session refresh is handled in proxy.ts
        }
      },
    },
  });
}
