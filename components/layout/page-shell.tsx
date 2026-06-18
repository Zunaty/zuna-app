import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function PageShell({ children, className, narrow }: PageShellProps) {
  return (
    <div className={cn("mx-auto px-4 py-12 sm:px-6 sm:py-16", narrow ? "max-w-3xl" : "max-w-6xl", className)}>
      {children}
    </div>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export type { PageHeaderProps };

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-10 max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">{eyebrow}</p> : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 text-lg text-muted-foreground">{description}</p> : null}
    </header>
  );
}
