"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppPreferencesStore } from "@/stores/categories-ui-store";
import type { ProfileCategory } from "@/lib/profile/categories";

export function ProfileCategoryTracker({
  category,
}: {
  category: ProfileCategory;
}) {
  const setLastProfileCategory = useAppPreferencesStore(
    (state) => state.setLastProfileCategory,
  );

  useEffect(() => {
    setLastProfileCategory(category);
  }, [category, setLastProfileCategory]);

  return null;
}

export function ProfileLandingRedirect() {
  const router = useRouter();
  const hasMounted = useRef(false);
  const lastProfileCategory = useAppPreferencesStore(
    (state) => state.lastProfileCategory,
  );

  const isHydrated = useAppPreferencesStore.persist.hasHydrated();

  useEffect(() => {
    if (!isHydrated) {
      return useAppPreferencesStore.persist.onFinishHydration(() => {
        if (hasMounted.current) {
          return;
        }

        hasMounted.current = true;
        router.replace(`/profile/${lastProfileCategory ?? "overview"}`);
      });
    }

    if (hasMounted.current) {
      return;
    }

    hasMounted.current = true;
    router.replace(`/profile/${lastProfileCategory ?? "overview"}`);
  }, [isHydrated, lastProfileCategory, router]);

  return null;
}
