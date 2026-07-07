import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DashboardCategory } from "@/lib/dashboard-categories";

interface DashboardUiStoreState {
  lastDashboardCategory: DashboardCategory | null;
  setLastDashboardCategory: (category: DashboardCategory) => void;
}

export const useDashboardUiStore = create<DashboardUiStoreState>()(
  persist(
    (set) => ({
      lastDashboardCategory: null,
      setLastDashboardCategory: (category) => {
        set({
          lastDashboardCategory: category,
        });
      },
    }),
    {
      name: "dashboard-ui-preferences",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastDashboardCategory: state.lastDashboardCategory,
      }),
    },
  ),
);
