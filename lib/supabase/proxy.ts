import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabasePublicEnv, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasSupabasePublicEnv) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getClaims();

  return supabaseResponse;
}
