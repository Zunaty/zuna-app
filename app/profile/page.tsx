import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileSettings } from "@/components/profile/profile-settings";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
  description: `Account and progress for ${site.name}.`,
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const displayName = profile?.display_name ?? user.user_metadata.display_name ?? user.email?.split("@")[0] ?? "Player";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Account"
        title={displayName}
        description="Your hub for saved progress, scores, and achievements as the playground grows."
      />

      <ProfileSettings
        userId={user.id}
        email={user.email ?? "—"}
        memberSince={memberSince}
        initialDisplayName={displayName}
        initialAvatarUrl={profile?.avatar_url ?? null}
        level={profile?.level ?? 1}
        points={profile?.points ?? 0}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </PageShell>
  );
}
