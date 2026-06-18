"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export function UserNav() {
  const pathname = usePathname();
  const { email, isLoading, signOut } = useAuthUser();
  const loginHref = `/auth/login?next=${encodeURIComponent(pathname)}`;

  if (isLoading) {
    return <div className="hidden h-9 w-16 animate-pulse rounded-md bg-muted md:block" aria-hidden />;
  }

  if (!email) {
    return (
      <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
        <Link href={loginHref}>Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/profile">Profile</Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  );
}
