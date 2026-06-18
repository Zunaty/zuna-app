import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your portfolio account.",
};

export default function ForgotPasswordPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Account",
          title: "Reset your password",
          description: "Enter your email and we'll send a link to choose a new password.",
        }}
      >
        <ForgotPasswordForm />
      </PageEnter>
    </PageShell>
  );
}
