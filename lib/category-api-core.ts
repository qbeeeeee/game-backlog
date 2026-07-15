import type { DashboardCategory } from "@/lib/dashboard/categories";
import {
  fetchTrackedItems,
  mergeTrackedStatusesByExternalIdOrTitle,
  toTrackedStatusFilter,
  type TrackedItemStatus,
  type TrackedItemSummary,
} from "@/lib/tracker/client";

export type DashboardGameStatus = "" | "Backlog" | "Playing" | "Completed";
export type DashboardTrackedItemStatus = TrackedItemStatus;
export type DashboardAssignableStatus = Exclude<DashboardGameStatus, "">;

export const DASHBOARD_TO_TRACKED_STATUS: Record<
  DashboardAssignableStatus,
  DashboardTrackedItemStatus
> = {
  Backlog: "BACKLOG",
  Playing: "IN_PROGRESS",
  Completed: "COMPLETED",
};

export function trackedToDashboardStatus(
  status: DashboardTrackedItemStatus,
): DashboardGameStatus {
  if (status === "BACKLOG") {
    return "Backlog";
  }

  if (status === "IN_PROGRESS") {
    return "Playing";
  }

  if (status === "COMPLETED") {
    return "Completed";
  }

  return "";
}

export interface DashboardGame {
  id: string;
  igdbId?: string | null;
  source?: string | null;
  coverUrl?: string | null;
  title: string;
  genre: string;
  type?: string;
  status: DashboardGameStatus;
  releaseYear: number;
  summary: string;
  rating: number;
}

export interface DashboardGameDetail extends DashboardGame {
  storyline: string | null;
  companies: string[];
  cast: string[];
  runtimeMinutes: number | null;
  coverUrl: string | null;
}

export interface GamesFilters {
  status?: DashboardAssignableStatus | "All";
  query?: string;
}

export const gameKeys = {
  all: ["dashboard-media"] as const,
  list: (filters: GamesFilters, category: DashboardCategory = "games") =>
    ["dashboard-media", category, "list", filters] as const,
  detail: (
    id: string,
    externalId?: string | null,
    category: DashboardCategory = "games",
  ) =>
    ["dashboard-media", category, "detail", id, externalId ?? "none"] as const,
};

const CATEGORY_TO_MEDIA_TYPE: Partial<
  Record<DashboardCategory, "GAME" | "MOVIE">
> = {
  games: "GAME",
  movies: "MOVIE",
};

const CATEGORY_TO_SOURCE: Partial<Record<DashboardCategory, string>> = {
  games: "IGDB",
  movies: "TMDB",
};

export async function fetchTrackedItemsForCategory(
  category: DashboardCategory,
  filters: GamesFilters,
): Promise<TrackedItemSummary[]> {
  const mediaType = CATEGORY_TO_MEDIA_TYPE[category];

  if (!mediaType) {
    return [];
  }

  const trackedStatus = toTrackedStatusFilter(
    filters.status,
    DASHBOARD_TO_TRACKED_STATUS,
  );

  return fetchTrackedItems({
    mediaType,
    status: trackedStatus,
    query: filters.query,
    limit: 100,
  });
}

export function mergeTrackedStatusesForCategory(
  items: DashboardGame[],
  trackedItems: TrackedItemSummary[],
  category: DashboardCategory,
): DashboardGame[] {
  return mergeTrackedStatusesByExternalIdOrTitle(items, trackedItems, {
    getExternalId: (item) => (category === "games" ? item.igdbId : item.id),
    getTitle: (item) => item.title,
    setStatus: (item, status) => ({
      ...item,
      status: status as DashboardGameStatus,
    }),
    trackedToUiStatus: trackedToDashboardStatus,
  });
}

export function toFallbackDashboardGame(
  item: TrackedItemSummary,
): DashboardGame {
  return {
    id: item.externalId ?? item.id,
    igdbId: item.externalId ?? null,
    source: item.source ?? undefined,
    coverUrl: null,
    title: item.title,
    genre: "Unknown",
    type: "General",
    status: trackedToDashboardStatus(item.status),
    releaseYear: new Date().getUTCFullYear(),
    summary: "No description available.",
    rating: 0,
  };
}

export function inferSourceFromCategory(
  category: DashboardCategory,
): string | undefined {
  return CATEGORY_TO_SOURCE[category];
}
