const STORAGE_KEY = "zuna-type-racer-settings";

export type TypeRacerSettings = {
  strictMode: boolean;
};

const DEFAULT_SETTINGS: TypeRacerSettings = {
  strictMode: false,
};

export function getSettings(): TypeRacerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_SETTINGS;
    }

    const strictMode = "strictMode" in parsed && parsed.strictMode === true;
    return { strictMode };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TypeRacerSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
