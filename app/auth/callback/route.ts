import { NextResponse } from "next/server";

import { safeRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

function getRedirectOrigin(request: Request): string {
  const { origin } = new URL(request.url);

  if (process.env.NODE_ENV === "development") {
    return origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const origin = getRedirectOrigin(request);
  const next = safeRedirect(searchParams.get("next"), "/profile");

  if (error) {
    const errorMessage = errorDescription ? decodeURIComponent(errorDescription) : error;
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent("No authorization code received")}`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
