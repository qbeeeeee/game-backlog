export const DASHBOARD_CATEGORIES = [
  "games",
  "movies",
  "series",
  "animes",
  "youtube",
] as const;

export type DashboardCategory = (typeof DASHBOARD_CATEGORIES)[number];

export type DashboardMediaType =
  | "GAME"
  | "MOVIE"
  | "SERIES"
  | "ANIME"
  | "YOUTUBE";

export const DASHBOARD_MEDIA_TYPE_BY_CATEGORY: Record<
  DashboardCategory,
  DashboardMediaType
> = {
  games: "GAME",
  movies: "MOVIE",
  series: "SERIES",
  animes: "ANIME",
  youtube: "YOUTUBE",
};

export const DASHBOARD_CATEGORY_META: Record<
  DashboardCategory,
  { label: string; description: string }
> = {
  games: {
    label: "Games",
    description:
      "Track your playable backlog with status, search, and detail pages.",
  },
  movies: {
    label: "Movies",
    description:
      "Curate your watchlist by mood, runtime, and weekend priority.",
  },
  series: {
    label: "Series",
    description: "Follow season progress and keep unfinished shows visible.",
  },
  animes: {
    label: "Animes",
    description: "Organize anime by arc status, studio, and tone.",
  },
  youtube: {
    label: "YouTube",
    description: "Manage channels, playlists, and deep-dive learning queues.",
  },
};

export function parseDashboardCategory(
  value: string | null | undefined,
): DashboardCategory {
  if (!value) {
    return "games";
  }

  const normalized = value.toLowerCase();
  return DASHBOARD_CATEGORIES.includes(normalized as DashboardCategory)
    ? (normalized as DashboardCategory)
    : "games";
}

export function parseDashboardCategoryStrict(
  value: string | null | undefined,
): DashboardCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  return DASHBOARD_CATEGORIES.includes(normalized as DashboardCategory)
    ? (normalized as DashboardCategory)
    : null;
}
