import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DashboardCategory } from "@/lib/dashboard-categories";
import type { ProfileCategory } from "@/lib/profile-categories";

interface AppPreferencesState {
  lastDashboardCategory: DashboardCategory | null;
  lastProfileCategory: ProfileCategory | null;

  setLastDashboardCategory: (category: DashboardCategory) => void;
  setLastProfileCategory: (category: ProfileCategory) => void;
}

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      lastDashboardCategory: null,
      lastProfileCategory: null,

      setLastDashboardCategory: (category) =>
        set({ lastDashboardCategory: category }),
      setLastProfileCategory: (category) =>
        set({ lastProfileCategory: category }),
    }),
    {
      name: "retro-hub-preferences", // One single key in local storage for everything!
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
