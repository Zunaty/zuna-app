export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {year} Victor Perez. Built with Next.js.</p>
        <p className="text-xs">Portfolio · Playground · Explore</p>
      </div>
    </footer>
  );
}
