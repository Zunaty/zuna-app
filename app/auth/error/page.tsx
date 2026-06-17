import Link from "next/link";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams;
  const message = error ? decodeURIComponent(error) : "Something went wrong during authentication.";

  return (
    <PageShell narrow>
      <PageHeader eyebrow="Account" title="Authentication error" description={message} />
      <Button asChild>
        <Link href="/auth/login">Try again</Link>
      </Button>
    </PageShell>
  );
}
