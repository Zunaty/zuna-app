import { DEFAULT_CATEGORY_SEQUENCE, DEFAULT_GAME, VOLUME_MAX, VOLUME_MIN } from "@/lib/prompt-run/constants";
import type { PromptRunModelState } from "@/lib/prompt-run/reducer";
import { createId } from "@/lib/prompt-run/round";

const STORAGE_KEY = "zuna-prompt-run";

export type PromptRunSettings = {
  categorySequence: readonly string[];
  volume: number;
  isMuted: boolean;
  hasSeenOnboarding: boolean;
};

export type PromptRunBestRun = {
  totalScore: number;
  completedRounds: number;
  savedAt: string;
};

type StoragePayload = {
  settings: PromptRunSettings;
  bestRun: PromptRunBestRun | null;
  activeRun: PromptRunModelState | null;
};

const DEFAULT_SETTINGS: PromptRunSettings = {
  categorySequence: DEFAULT_CATEGORY_SEQUENCE,
  volume: 0.5,
  isMuted: false,
  hasSeenOnboarding: false,
};

function defaultPayload(): StoragePayload {
  return {
    settings: DEFAULT_SETTINGS,
    bestRun: null,
    activeRun: null,
  };
}

function readStorage(): StoragePayload {
  if (typeof window === "undefined") {
    return defaultPayload();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultPayload();
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return defaultPayload();
    }

    const data = parsed as Partial<StoragePayload> & {
      settings?: Partial<PromptRunSettings>;
    };

    return {
      settings: {
        ...DEFAULT_SETTINGS,
        ...data.settings,
        categorySequence: data.settings?.categorySequence ?? DEFAULT_CATEGORY_SEQUENCE,
        volume: Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, data.settings?.volume ?? DEFAULT_SETTINGS.volume)),
      },
      bestRun: data.bestRun ?? null,
      activeRun: data.activeRun ?? null,
    };
  } catch {
    return defaultPayload();
  }
}

function writeStorage(payload: StoragePayload): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getPromptRunSettings(): PromptRunSettings {
  return readStorage().settings;
}

export function savePromptRunSettings(settings: PromptRunSettings): void {
  const current = readStorage();
  writeStorage({ ...current, settings });
}

export function getBestRun(): PromptRunBestRun | null {
  return readStorage().bestRun;
}

export function saveBestRunIfBetter(totalScore: number, completedRounds: number): boolean {
  const current = readStorage();
  const existing = current.bestRun;

  if (existing && totalScore < existing.totalScore) {
    return false;
  }

  if (existing && totalScore === existing.totalScore && completedRounds <= existing.completedRounds) {
    return false;
  }

  writeStorage({
    ...current,
    bestRun: {
      totalScore,
      completedRounds,
      savedAt: new Date().toISOString(),
    },
  });
  return true;
}

export function getActiveRun(): PromptRunModelState | null {
  const active = readStorage().activeRun;
  if (!active || active.game.phase === "fresh") {
    return null;
  }
  return active;
}

export function saveActiveRun(state: PromptRunModelState): void {
  const current = readStorage();
  if (state.game.phase === "fresh") {
    writeStorage({ ...current, activeRun: null });
    return;
  }
  writeStorage({ ...current, activeRun: state });
}

export function clearActiveRun(): void {
  const current = readStorage();
  writeStorage({ ...current, activeRun: null });
}

export function createFreshModelState(): PromptRunModelState {
  return {
    game: { ...DEFAULT_GAME, id: createId() },
    round: null,
  };
}
