import { updateSession } from "@/lib/supabase/proxy";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { hasSupabasePublicEnv, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname === "/auth/callback") {
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const callbackUrl = new URL("/auth/callback", request.nextUrl.origin);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(callbackUrl);
  }

  if (!pathname.startsWith("/profile") || !hasSupabasePublicEnv) {
    return response;
  }

  const allCookies = [...request.cookies.getAll(), ...response.cookies.getAll()];
  const cookieMap = new Map(allCookies.map((cookie) => [cookie.name, cookie.value]));

  const supabase = createServerClient<Database>(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      getAll() {
        return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll() {
        // Handled by updateSession
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(request, response, "/auth/login");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
