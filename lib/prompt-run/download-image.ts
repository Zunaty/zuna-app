export function getGeneratedImageFilename(roundNumber?: number, seed?: number): string {
  if (roundNumber !== undefined) {
    return `prompt-run-round-${roundNumber}.jpeg`;
  }
  if (seed !== undefined) {
    return `prompt-run-seed-${seed}.jpeg`;
  }
  return "prompt-run.jpeg";
}

export async function downloadGeneratedImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch image.");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
