import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";
import {
  createLocalStorageSnapshotCache,
  parseJsonObject,
  readLocalJsonObject,
  subscribeStorageEvents,
  writeLocalJson,
} from "@/lib/storage/local";
import { DEFAULT_STYLE_LAB_PREFERENCE, STYLE_LAB_CHANGE_EVENT, type StyleLabPreference } from "@/lib/style-lab/config";
import { parseStyleLabPreference } from "@/lib/style-lab/parse";

const STORAGE_KEY = LOCAL_STORAGE_KEYS.styleLab;

export function getStyleLabPreference(): StyleLabPreference {
  const data = readLocalJsonObject(STORAGE_KEY);
  if (!data) {
    return DEFAULT_STYLE_LAB_PREFERENCE;
  }
  return parseStyleLabPreference(data);
}

const preferenceSnapshot = createLocalStorageSnapshotCache(
  STORAGE_KEY,
  getStyleLabPreference,
  DEFAULT_STYLE_LAB_PREFERENCE,
);

export function getStyleLabPreferenceSnapshot(): StyleLabPreference {
  return preferenceSnapshot.getSnapshot();
}

export function saveStyleLabPreference(preference: StyleLabPreference): void {
  const raw = writeLocalJson(STORAGE_KEY, preference, {
    eventName: STYLE_LAB_CHANGE_EVENT,
    swallowErrors: true,
  });
  preferenceSnapshot.remember(raw, preference);
}

export function subscribeStyleLabPreference(onStoreChange: () => void): () => void {
  return subscribeStorageEvents(STYLE_LAB_CHANGE_EVENT, onStoreChange);
}

/** Parse preference from a cookie / raw JSON string. */
export function parseStyleLabPreferenceRaw(raw: string | undefined): StyleLabPreference {
  if (!raw) {
    return DEFAULT_STYLE_LAB_PREFERENCE;
  }

  const direct = parseJsonObject(raw);
  if (direct) {
    return parseStyleLabPreference(direct);
  }

  try {
    const decoded = parseJsonObject(decodeURIComponent(raw));
    if (decoded) {
      return parseStyleLabPreference(decoded);
    }
  } catch {
    // Ignore decode errors — fall through to default.
  }

  return DEFAULT_STYLE_LAB_PREFERENCE;
}
