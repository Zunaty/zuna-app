import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";
import { readLocalJsonObject, writeLocalJson } from "@/lib/storage/local";

const STORAGE_KEY = LOCAL_STORAGE_KEYS.typeRacerSettings;

export type TypeRacerSettings = {
  strictMode: boolean;
};

const DEFAULT_SETTINGS: TypeRacerSettings = {
  strictMode: false,
};

export function getSettings(): TypeRacerSettings {
  const parsed = readLocalJsonObject(STORAGE_KEY);
  if (!parsed) {
    return DEFAULT_SETTINGS;
  }

  return { strictMode: parsed.strictMode === true };
}

export function saveSettings(settings: TypeRacerSettings): void {
  writeLocalJson(STORAGE_KEY, settings);
}
