"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { syncAchievementsFromLocal, unlockAchievementsForUser } from "@/app/achievements/actions";
import { AchievementToaster } from "@/components/achievements/achievement-toast";
import type { AchievementId } from "@/lib/achievements/definitions";
import {
  getLocalUnlocks,
  getServerUnlocksSnapshot,
  getUnlocksSnapshot,
  mergeUnlocksIntoLocal,
  saveLocalUnlock,
  subscribeAchievementsStorage,
} from "@/lib/achievements/storage";
import { resolveDerivedUnlocks, type UnlockedAchievements } from "@/lib/achievements/unlocks";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

type AchievementContextValue = {
  unlocked: UnlockedAchievements;
  unlock: (id: AchievementId) => void;
};

const AchievementContext = createContext<AchievementContextValue | null>(null);

type AchievementProviderProps = {
  children: ReactNode;
};

export function AchievementProvider({ children }: AchievementProviderProps) {
  const unlocked = useSyncExternalStore(subscribeAchievementsStorage, getUnlocksSnapshot, getServerUnlocksSnapshot);
  const [toastIds, setToastIds] = useState<AchievementId[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthenticatedRef = useRef(false);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!hasSupabasePublicEnv) {
      return;
    }

    const supabase = createClient();

    const applyAuthState = (authenticated: boolean) => {
      isAuthenticatedRef.current = authenticated;
      setIsAuthenticated(authenticated);
    };

    void supabase.auth.getUser().then(({ data: { user } }) => {
      applyAuthState(user !== null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthState(session !== null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;

    void syncAchievementsFromLocal(getLocalUnlocks()).then((result) => {
      if (!result.error) {
        mergeUnlocksIntoLocal(result.unlocks);
      }
    });
  }, [isAuthenticated]);

  const dismissToast = useCallback((id: AchievementId) => {
    setToastIds((current) => current.filter((toastId) => toastId !== id));
  }, []);

  const unlock = useCallback((id: AchievementId) => {
    const unlockedAt = new Date().toISOString();

    if (!saveLocalUnlock(id, unlockedAt)) {
      return;
    }

    const { unlocks: resolved, added } = resolveDerivedUnlocks(getLocalUnlocks());
    if (added.length > 0) {
      mergeUnlocksIntoLocal(resolved);
    }

    const newIds = [id, ...added];
    setToastIds((current) => [...current, ...newIds.filter((newId) => !current.includes(newId))]);

    if (isAuthenticatedRef.current) {
      const payload: UnlockedAchievements = { [id]: unlockedAt };
      for (const addedId of added) {
        payload[addedId] = resolved[addedId];
      }
      void unlockAchievementsForUser(payload);
    }
  }, []);

  return (
    <AchievementContext.Provider value={{ unlocked, unlock }}>
      {children}
      <AchievementToaster toastIds={toastIds} onDismiss={dismissToast} />
    </AchievementContext.Provider>
  );
}

export function useAchievements(): AchievementContextValue {
  const context = useContext(AchievementContext);

  if (!context) {
    return {
      unlocked: {},
      unlock: () => undefined,
    };
  }

  return context;
}
