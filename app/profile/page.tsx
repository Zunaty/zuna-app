import type { Metadata } from "next";

import Link from "next/link";

import { redirect } from "next/navigation";

import { ProfileSettings } from "@/components/profile/profile-settings";

import { ProfileStats } from "@/components/profile/profile-stats";

import { PageEnter } from "@/components/motion/page-enter";

import { PageShell } from "@/components/layout/page-shell";

import { Button } from "@/components/ui/button";

import { isAchievementId } from "@/lib/achievements/definitions";

import type { UnlockedAchievements } from "@/lib/achievements/unlocks";

import { site } from "@/lib/data/site";

import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

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

  const [{ data: profile }, { scores }, { data: achievementRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    getUserPlaygroundScores(),
    supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user.id),
  ]);

  const serverUnlocks: UnlockedAchievements = {};

  for (const row of achievementRows ?? []) {
    if (isAchievementId(row.achievement_id)) {
      serverUnlocks[row.achievement_id] = row.unlocked_at;
    }
  }

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
      <PageEnter
        header={{
          eyebrow: "Account",

          title: displayName,

          description: "Your stats, scores, and achievements across the site.",
        }}
      >
        <div className="space-y-6">
          <ProfileStats serverUnlocks={serverUnlocks} typeRacer={scores.typeRacer} promptRun={scores.promptRun} />

          <ProfileSettings
            userId={user.id}
            email={user.email ?? "—"}
            memberSince={memberSince}
            initialDisplayName={displayName}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
