"use client";

import { X, ZoomIn } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GeneratedImagePreviewProps = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
};

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function GeneratedImagePreview({
  url,
  alt,
  width,
  height,
  className,
  imageClassName = "max-h-[min(50vh,480px)]",
}: GeneratedImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-lg border bg-muted/20 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        aria-label="View full size image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className={cn("mx-auto w-full object-contain", imageClassName)}
          width={width}
          height={height}
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "bg-black/0 transition-colors group-hover:bg-black/25",
          )}
          aria-hidden
        >
          <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-3.5" />
            View full size
          </span>
        </span>
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label={alt}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/85"
                onClick={() => setOpen(false)}
                aria-label="Close image preview"
              />
              <div className="relative z-10 flex max-h-full max-w-full items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="fixed right-4 top-4 z-[60] shadow-md"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={alt}
                  className="max-h-[min(90vh,900px)] max-w-[min(92vw,1200px)] object-contain"
                  width={width}
                  height={height}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
