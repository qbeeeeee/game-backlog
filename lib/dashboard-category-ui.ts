import type {
  DashboardAssignableStatus,
  DashboardGameDetail,
  DashboardGameStatus,
} from "@/lib/category-api";
import type { DashboardCategory } from "@/lib/dashboard-categories";

export type DashboardStatusFilter = DashboardAssignableStatus | "All";

interface CategoryStatusCopy {
  unassignedLabel: string;
  searchPlaceholder: string;
  labels: Record<DashboardAssignableStatus, string>;
  metricLabels: Record<DashboardAssignableStatus, string>;
}

interface CategoryDetailCopy {
  summaryLabel: string;
  secondaryLabel: string | null;
  rosterLabel: string;
  rosterEmptyMessage: string;
  extraTileLabel: string | null;
}

const GAME_STATUS_COPY: CategoryStatusCopy = {
  unassignedLabel: "Unassigned",
  searchPlaceholder: "Search by title, genre, or type",
  labels: {
    Backlog: "Backlog",
    Playing: "Playing",
    Completed: "Completed",
  },
  metricLabels: {
    Backlog: "In Backlog",
    Playing: "Playing",
    Completed: "Completed",
  },
};

const WATCH_STATUS_COPY: CategoryStatusCopy = {
  unassignedLabel: "Not set",
  searchPlaceholder: "Search by title, genre, cast, or studio",
  labels: {
    Backlog: "To Watch",
    Playing: "Watching",
    Completed: "Seen",
  },
  metricLabels: {
    Backlog: "To Watch",
    Playing: "Watching",
    Completed: "Seen",
  },
};

const STATUS_COPY_BY_CATEGORY: Record<DashboardCategory, CategoryStatusCopy> = {
  games: GAME_STATUS_COPY,
  movies: WATCH_STATUS_COPY,
  series: WATCH_STATUS_COPY,
  animes: WATCH_STATUS_COPY,
  youtube: WATCH_STATUS_COPY,
};

const DETAIL_COPY_BY_CATEGORY: Record<DashboardCategory, CategoryDetailCopy> = {
  games: {
    summaryLabel: "Description",
    secondaryLabel: "Story Line",
    rosterLabel: "Companies",
    rosterEmptyMessage: "No company info available for this game.",
    extraTileLabel: null,
  },
  movies: {
    summaryLabel: "Overview",
    secondaryLabel: null,
    rosterLabel: "Cast",
    rosterEmptyMessage: "No cast info available for this movie.",
    extraTileLabel: "Runtime",
  },
  series: {
    summaryLabel: "Overview",
    secondaryLabel: null,
    rosterLabel: "Credits",
    rosterEmptyMessage: "No credits available.",
    extraTileLabel: null,
  },
  animes: {
    summaryLabel: "Overview",
    secondaryLabel: null,
    rosterLabel: "Credits",
    rosterEmptyMessage: "No credits available.",
    extraTileLabel: null,
  },
  youtube: {
    summaryLabel: "Overview",
    secondaryLabel: null,
    rosterLabel: "Channel",
    rosterEmptyMessage: "No channel info available.",
    extraTileLabel: null,
  },
};

const DASHBOARD_FILTER_ORDER: DashboardStatusFilter[] = [
  "All",
  "Backlog",
  "Playing",
  "Completed",
];

export function getCategoryStatusCopy(category: DashboardCategory) {
  return STATUS_COPY_BY_CATEGORY[category];
}

export function getStatusFilterOptions(category: DashboardCategory): Array<{
  value: DashboardStatusFilter;
  label: string;
}> {
  const statusCopy = getCategoryStatusCopy(category);

  return DASHBOARD_FILTER_ORDER.map((value) => ({
    value,
    label: value === "All" ? "All" : statusCopy.labels[value],
  }));
}

export function parseStatusFilterParam(
  value: string | null,
): DashboardStatusFilter {
  if (!value) {
    return "All";
  }

  const normalized = value.toLowerCase();

  if (normalized === "backlog") {
    return "Backlog";
  }

  if (normalized === "playing") {
    return "Playing";
  }

  if (normalized === "completed") {
    return "Completed";
  }

  return "All";
}

export function getStatusLabel(
  category: DashboardCategory,
  status: DashboardGameStatus,
): string {
  const statusCopy = getCategoryStatusCopy(category);

  if (!status) {
    return statusCopy.unassignedLabel;
  }

  return statusCopy.labels[status];
}

export function getStatusMetricLabel(
  category: DashboardCategory,
  status: DashboardAssignableStatus,
): string {
  return getCategoryStatusCopy(category).metricLabels[status];
}

export function getDetailCopy(category: DashboardCategory) {
  return DETAIL_COPY_BY_CATEGORY[category];
}

export function getDetailRosterValues(
  category: DashboardCategory,
  item: DashboardGameDetail,
): string[] {
  if (category === "movies") {
    return item.cast;
  }

  return item.companies;
}

export function getDetailExtraTileValue(
  category: DashboardCategory,
  item: DashboardGameDetail,
): string | null {
  if (category === "movies") {
    return item.runtimeMinutes ? `${item.runtimeMinutes} min` : "N/A";
  }

  return null;
}
