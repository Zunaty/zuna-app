import { fal } from "@fal-ai/client";

export type PromptRunImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export const PROMPT_RUN_IMAGE_SIZES: readonly PromptRunImageSize[] = [
  "square_hd",
  "square",
  "portrait_4_3",
  "portrait_16_9",
  "landscape_4_3",
  "landscape_16_9",
] as const;

export const MAX_PROMPT_LENGTH = 500;
export const GUEST_GENERATION_DAILY_LIMIT = 10;
export const AUTH_GENERATION_DAILY_LIMIT = 20;
export const DEFAULT_IMAGE_SIZE: PromptRunImageSize = "square_hd";

export type GeneratedImage = {
  url: string;
  width?: number;
  height?: number;
};

export function isPromptRunImageSize(value: string): value is PromptRunImageSize {
  return (PROMPT_RUN_IMAGE_SIZES as readonly string[]).includes(value);
}

export function isPromptRunGenerationEnabled(): boolean {
  if (process.env.PROMPT_RUN_GENERATION_ENABLED === "false") {
    return false;
  }
  return Boolean(process.env.FAL_KEY?.trim());
}

export function getFalImageModel(): string {
  return process.env.FAL_IMAGE_MODEL?.trim() || "fal-ai/flux-2/turbo";
}

export function normalizePrompt(prompt: string): { prompt: string; truncated: boolean } {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { prompt: "", truncated: false };
  }
  if (trimmed.length <= MAX_PROMPT_LENGTH) {
    return { prompt: trimmed, truncated: false };
  }
  return { prompt: trimmed.slice(0, MAX_PROMPT_LENGTH), truncated: true };
}

type FalImageOutput = {
  images?: Array<{ url: string; width?: number; height?: number }>;
  seed?: number;
};

export async function generatePromptRunImage(params: {
  prompt: string;
  imageSize?: PromptRunImageSize;
  seed?: number;
}): Promise<{ images: GeneratedImage[]; seed?: number }> {
  const credentials = process.env.FAL_KEY?.trim();
  if (!credentials) {
    throw new Error("GENERATION_NOT_CONFIGURED");
  }

  fal.config({ credentials });

  const result = await fal.subscribe(getFalImageModel(), {
    input: {
      prompt: params.prompt,
      image_size: params.imageSize ?? DEFAULT_IMAGE_SIZE,
      num_images: 1,
      output_format: "jpeg",
      enable_safety_checker: true,
      ...(params.seed !== undefined ? { seed: params.seed } : {}),
    },
  });

  const data = result.data as FalImageOutput;
  const images = (data.images ?? []).map((image) => ({
    url: image.url,
    width: image.width,
    height: image.height,
  }));

  if (images.length === 0) {
    throw new Error("GENERATION_EMPTY");
  }

  return { images, seed: data.seed };
}
