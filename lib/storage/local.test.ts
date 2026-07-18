import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createLocalStorageSnapshotCache,
  parseJsonObject,
  readLocalJsonObject,
  subscribeStorageEvents,
  writeLocalJson,
} from "@/lib/storage/local";

describe("parseJsonObject", () => {
  it("returns null for empty input", () => {
    expect(parseJsonObject(null)).toBeNull();
    expect(parseJsonObject("")).toBeNull();
  });

  it("parses plain objects", () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("rejects arrays, primitives, and invalid JSON", () => {
    expect(parseJsonObject("[1]")).toBeNull();
    expect(parseJsonObject('"hi"')).toBeNull();
    expect(parseJsonObject("not-json")).toBeNull();
  });
});

describe("localStorage helpers", () => {
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<EventListener>>();

  afterEach(() => {
    store.clear();
    listeners.clear();
    vi.unstubAllGlobals();
  });

  function stubWindow(options?: { throwOnSet?: boolean }) {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (options?.throwOnSet) {
            throw new Error("quota");
          }
          store.set(key, value);
        },
      },
      addEventListener: (type: string, listener: EventListener) => {
        const set = listeners.get(type) ?? new Set();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener: (type: string, listener: EventListener) => {
        listeners.get(type)?.delete(listener);
      },
      dispatchEvent: (event: Event) => {
        listeners.get(event.type)?.forEach((listener) => listener(event));
        return true;
      },
    });
  }

  it("reads and writes JSON objects", () => {
    stubWindow();
    expect(readLocalJsonObject("k")).toBeNull();
    expect(writeLocalJson("k", { score: 12 })).toBe('{"score":12}');
    expect(readLocalJsonObject("k")).toEqual({ score: 12 });
  });

  it("dispatches a custom event on write", () => {
    stubWindow();
    const onChange = vi.fn();
    const unsubscribe = subscribeStorageEvents("demo-updated", onChange);
    writeLocalJson("k", { ok: true }, { eventName: "demo-updated" });
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("swallows write errors when requested", () => {
    stubWindow({ throwOnSet: true });
    const onChange = vi.fn();
    subscribeStorageEvents("demo-updated", onChange);
    expect(writeLocalJson("k", { ok: true }, { eventName: "demo-updated", swallowErrors: true })).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps snapshot referentially stable until the raw value changes", () => {
    stubWindow();
    let reads = 0;
    const cache = createLocalStorageSnapshotCache(
      "k",
      () => {
        reads += 1;
        return { reads };
      },
      { reads: 0 },
    );

    writeLocalJson("k", { v: 1 });
    const first = cache.getSnapshot();
    const second = cache.getSnapshot();
    expect(first).toBe(second);
    expect(reads).toBe(1);

    writeLocalJson("k", { v: 2 });
    const third = cache.getSnapshot();
    expect(third).not.toBe(first);
    expect(reads).toBe(2);
  });
});
