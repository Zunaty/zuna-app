import Link from "next/link";

import { comingSoonLinks, site, socialLinks } from "@/lib/data/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">{site.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{site.title}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Connect</p>
          <ul className="mt-3 space-y-2 text-sm">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Coming soon</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {comingSoonLinks.map((link) => (
              <li key={link.href}>
                {link.label} — {link.description}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {site.name}. Built with Next.js.
          </p>
          <p>Interactive portfolio — achievements & games on the way.</p>
        </div>
      </div>
    </footer>
  );
}
