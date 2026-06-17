"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export function UserNav() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabasePublicEnv);

  useEffect(() => {
    if (!hasSupabasePublicEnv) {
      return;
    }

    const supabase = createClient();

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      setIsLoading(false);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return <div className="hidden h-9 w-16 animate-pulse rounded-md bg-muted md:block" aria-hidden />;
  }

  if (!email) {
    return (
      <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
        <Link href="/auth/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/profile">Profile</Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
        Sign out
      </Button>
    </div>
  );
}
