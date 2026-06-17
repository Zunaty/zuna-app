import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
  description: `Account and progress for ${site.name}.`,
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const displayName = profile?.display_name ?? user.user_metadata.display_name ?? user.email?.split("@")[0] ?? "Player";

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Account"
        title={displayName}
        description="Your hub for saved progress, scores, and achievements as the playground grows."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Level & points</h2>
          <p className="mt-4 text-3xl font-bold text-primary">Level {profile?.level ?? 1}</p>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.points ?? 0} points</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Achievements and point earning roll out with the playground — your account is ready.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </PageShell>
  );
}
