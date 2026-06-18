import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/auth-forms";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account to save progress on Victor Perez's portfolio playground.",
};

export default function SignUpPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Account",
          title: "Create an account",
          description: "The portfolio is fully open without signing in. An account lets you save progress later.",
        }}
      >
        <SignUpForm />
      </PageEnter>
    </PageShell>
  );
}
