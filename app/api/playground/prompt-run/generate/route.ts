import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_GENERATION_DAILY_LIMIT,
  GUEST_GENERATION_DAILY_LIMIT,
  generatePromptRunImage,
  isPromptRunGenerationEnabled,
  isPromptRunImageSize,
  normalizePrompt,
} from "@/lib/prompt-run/generation";
import { checkGenerationRateLimit } from "@/lib/prompt-run/rate-limit";
import { createClient } from "@/lib/supabase/server";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET() {
  return NextResponse.json({ enabled: isPromptRunGenerationEnabled() });
}

export async function POST(request: NextRequest) {
  if (!isPromptRunGenerationEnabled()) {
    return NextResponse.json({ error: "Image generation is not available." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { prompt, aspectRatio, seed } = body as {
    prompt?: unknown;
    aspectRatio?: unknown;
    seed?: unknown;
  };

  if (typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const { prompt: normalizedPrompt, truncated } = normalizePrompt(prompt);
  if (!normalizedPrompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  if (aspectRatio !== undefined && (typeof aspectRatio !== "string" || !isPromptRunImageSize(aspectRatio))) {
    return NextResponse.json({ error: "Invalid aspect ratio." }, { status: 400 });
  }

  if (seed !== undefined && (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0)) {
    return NextResponse.json({ error: "Invalid seed." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimitKey = user?.id ?? `guest:${getClientIp(request)}`;
  const dailyLimit = user ? AUTH_GENERATION_DAILY_LIMIT : GUEST_GENERATION_DAILY_LIMIT;
  const rateLimit = checkGenerationRateLimit(rateLimitKey, dailyLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Daily generation limit reached. Try again tomorrow." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      },
    );
  }

  try {
    const result = await generatePromptRunImage({
      prompt: normalizedPrompt,
      imageSize: aspectRatio,
      seed,
    });

    console.info("[prompt-run] generation", {
      userId: user?.id ?? null,
      imageCount: result.images.length,
      truncated,
    });

    return NextResponse.json(
      {
        images: result.images,
        seed: result.seed,
        truncated: truncated || undefined,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERATION_FAILED";

    if (message === "GENERATION_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Image generation is not available." }, { status: 503 });
    }

    if (message === "GENERATION_EMPTY") {
      return NextResponse.json({ error: "No image was returned." }, { status: 502 });
    }

    console.error("[prompt-run] generation failed", { userId: user?.id ?? null });
    return NextResponse.json({ error: "Failed to generate image." }, { status: 502 });
  }
}
