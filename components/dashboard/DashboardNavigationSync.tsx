"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUiStore } from "@/stores/dashboard-ui-store";
import type { DashboardCategory } from "@/lib/dashboard-categories";

export function DashboardCategoryTracker({
  category,
}: {
  category: DashboardCategory;
}) {
  const setLastDashboardCategory = useDashboardUiStore(
    (state) => state.setLastDashboardCategory,
  );

  useEffect(() => {
    setLastDashboardCategory(category);
  }, [category, setLastDashboardCategory]);

  return null;
}

export function DashboardLandingRedirect() {
  const router = useRouter();
  const hasMounted = useRef(false);
  const lastDashboardCategory = useDashboardUiStore(
    (state) => state.lastDashboardCategory,
  );
  const isHydrated = useDashboardUiStore.persist.hasHydrated();

  useEffect(() => {
    if (!isHydrated) {
      return useDashboardUiStore.persist.onFinishHydration(() => {
        if (hasMounted.current) {
          return;
        }

        hasMounted.current = true;
        router.replace(`/dashboard/${lastDashboardCategory ?? "games"}`);
      });
    }

    if (hasMounted.current) {
      return;
    }

    hasMounted.current = true;
    router.replace(`/dashboard/${lastDashboardCategory ?? "games"}`);
  }, [isHydrated, lastDashboardCategory, router]);

  return null;
}
