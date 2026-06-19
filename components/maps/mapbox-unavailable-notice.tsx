type MapboxUnavailableNoticeProps = {
  className?: string;
  message?: string;
};

export function MapboxUnavailableNotice({
  className,
  message = "Map unavailable — add NEXT_PUBLIC_MAPBOX_TOKEN to your environment to enable maps.",
}: MapboxUnavailableNoticeProps) {
  return (
    <div
      className={`flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center ${className ?? ""}`}
      role="status"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
