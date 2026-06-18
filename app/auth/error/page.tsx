import Link from "next/link";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function formatAuthError(error: string | undefined): string {
  if (!error) {
    return "Something went wrong during authentication.";
  }

  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams;
  const message = formatAuthError(error);

  return (
    <PageShell narrow>
      <PageHeader eyebrow="Account" title="Authentication error" description={message} />
      <Button asChild>
        <Link href="/auth/login">Try again</Link>
      </Button>
    </PageShell>
  );
}
