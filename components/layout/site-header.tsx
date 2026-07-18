"use client";

import { Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { navLinks } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const navLinkClassName = (active: boolean) =>
  cn(
    "rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground",
  );

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const { email, isLoading, signOut } = useAuthUser();
  const loginHref = `/auth/login?next=${encodeURIComponent(pathname)}`;
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    if (open) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    firstMobileLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Home"
          onClick={() => setOpen(false)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname === "/"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Home className="size-5" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={navLinkClassName(active)}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <UserNav />
          <ModeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id={menuId} className="border-t border-border/60 px-4 py-3 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {navLinks.map((item, index) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    ref={index === 0 ? firstMobileLinkRef : undefined}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(navLinkClassName(active), "block")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {isLoading ? (
              <li className="border-t border-border/60 pt-2">
                <div className="mx-3 h-9 animate-pulse rounded-md bg-muted" aria-hidden />
              </li>
            ) : email ? (
              <>
                <li className="border-t border-border/60 pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className={cn(
                      navLinkClassName(pathname === "/profile"),
                      "block hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li className="border-t border-border/60 pt-2">
                <Link
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className={cn(navLinkClassName(false), "block hover:bg-accent hover:text-accent-foreground")}
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
