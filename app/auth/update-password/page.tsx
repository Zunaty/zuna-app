import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Update password",
  description: "Set a new password for your portfolio account.",
};

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/forgot-password");
  }

  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Account",
          title: "Choose a new password",
          description: "Your reset link is valid for a limited time. Pick a strong password to finish.",
        }}
      >
        <UpdatePasswordForm />
      </PageEnter>
    </PageShell>
  );
}
