import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/auth-forms";
import { PageHeader, PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save progress across the portfolio playground.",
};

export default function LoginPage() {
  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Account"
        title="Welcome back"
        description="Sign in to sync scores, favorites, and achievements when those features launch."
      />
      <LoginForm />
    </PageShell>
  );
}
