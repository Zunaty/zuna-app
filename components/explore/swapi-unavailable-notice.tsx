type SwapiUnavailableNoticeProps = {
  className?: string;
};

export function SwapiUnavailableNotice({ className }: SwapiUnavailableNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center ${className ?? ""}`}
      role="status"
    >
      <p className="text-sm font-medium text-foreground">The Star Wars API isn&apos;t working right now</p>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t load data from SWAPI. This is usually temporary — try again in a few minutes.
      </p>
    </div>
  );
}
