/** Parse a JSON object from a storage string. Arrays and primitives return null. */
export function parseJsonObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Read and parse a JSON object from localStorage. SSR-safe. */
export function readLocalJsonObject(key: string): Record<string, unknown> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseJsonObject(window.localStorage.getItem(key));
  } catch {
    return null;
  }
}

type WriteLocalJsonOptions = {
  eventName?: string;
  /** When true, quota / private-mode failures are ignored (still dispatches event). */
  swallowErrors?: boolean;
};

/**
 * Serialize `value` to localStorage. Returns the written raw string, or null
 * when the write failed and errors were swallowed.
 */
export function writeLocalJson(key: string, value: unknown, options: WriteLocalJsonOptions = {}): string | null {
  const raw = JSON.stringify(value);

  try {
    window.localStorage.setItem(key, raw);
  } catch (error) {
    if (!options.swallowErrors) {
      throw error;
    }

    if (options.eventName) {
      window.dispatchEvent(new Event(options.eventName));
    }

    return null;
  }

  if (options.eventName) {
    window.dispatchEvent(new Event(options.eventName));
  }

  return raw;
}

/** Subscribe to a same-tab custom event plus cross-tab `storage` events. */
export function subscribeStorageEvents(eventName: string, onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(eventName, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(eventName, handler);
    window.removeEventListener("storage", handler);
  };
}

type LocalStorageSnapshotCache<T> = {
  getSnapshot: () => T;
  /** Update the cache after a known write (avoids an extra read). */
  remember: (raw: string | null, value: T) => void;
};

/**
 * Referentially-stable snapshot helper for `useSyncExternalStore`.
 * Re-reads only when the underlying localStorage raw string changes.
 */
export function createLocalStorageSnapshotCache<T>(
  key: string,
  readValue: () => T,
  empty: T,
): LocalStorageSnapshotCache<T> {
  let cachedRaw: string | null | undefined;
  let cachedValue: T = empty;

  return {
    getSnapshot() {
      if (typeof window === "undefined") {
        return empty;
      }

      const raw = window.localStorage.getItem(key);
      if (raw === cachedRaw) {
        return cachedValue;
      }

      cachedRaw = raw;
      cachedValue = readValue();
      return cachedValue;
    },
    remember(raw, value) {
      cachedRaw = raw;
      cachedValue = value;
    },
  };
}
