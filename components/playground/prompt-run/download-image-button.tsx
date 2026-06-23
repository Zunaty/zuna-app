"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { downloadGeneratedImage } from "@/lib/prompt-run/download-image";

type DownloadImageButtonProps = {
  url: string;
  filename: string;
};

export function DownloadImageButton({ url, filename }: DownloadImageButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isDownloading}
      onClick={() => {
        setIsDownloading(true);
        void downloadGeneratedImage(url, filename).finally(() => {
          setIsDownloading(false);
        });
      }}
    >
      {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      Download
    </Button>
  );
}
