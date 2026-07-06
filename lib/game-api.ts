import {
  fetchTrackedItems,
  mergeTrackedStatusesByExternalIdOrTitle,
  normalizeForCompare,
  toTrackedStatusFilter,
  type TrackedItemStatus,
  type TrackedItemSummary,
} from "@/lib/tracker-client";

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
  coverUrl: string | null;
}

export interface GamesFilters {
  status?: DashboardAssignableStatus | "All";
  query?: string;
}

export const gameKeys = {
  all: ["games"] as const,
  list: (filters: GamesFilters) => ["games", "list", filters] as const,
  detail: (id: string, igdbId?: string | null) =>
    ["games", "detail", id, igdbId ?? "none"] as const,
};

interface TwitchIgdbGame {
  id: string;
  name: string;
  description: string | null;
  summary?: string | null;
  storyline?: string | null;
  releaseDate: string | null;
  rating: number | null;
  coverUrl?: string | null;
  companies?: string[];
  genres: string[];
  twitch?: {
    id: string | null;
    boxArtUrl: string | null;
    igdbId: string | null;
  };
}

interface TwitchIgdbGamesResponse {
  source: "twitch-top" | "igdb-search";
  query?: string;
  data: TwitchIgdbGame[];
  pagination?: {
    cursor?: string;
  };
}

async function fetchTrackedItemsForGames(
  filters: GamesFilters,
): Promise<TrackedItemSummary[]> {
  const trackedStatus = toTrackedStatusFilter(
    filters.status,
    DASHBOARD_TO_TRACKED_STATUS,
  );

  return fetchTrackedItems({
    mediaType: "GAME",
    status: trackedStatus,
    query: filters.query,
    limit: 100,
  });
}

async function mapTrackedItemsToDashboardGames(
  trackedItems: TrackedItemSummary[],
): Promise<DashboardGame[]> {
  const detailResults = await Promise.allSettled(
    trackedItems.map(async (item) => {
      if (item.source === "IGDB" && item.externalId) {
        const detail = await fetchDashboardGameDetail(
          item.externalId,
          item.externalId,
        );

        return {
          ...detail,
          id: item.externalId,
          igdbId: item.externalId,
          title: item.title || detail.title,
          status: trackedToDashboardStatus(item.status),
        } satisfies DashboardGame;
      }

      return {
        id: item.externalId ?? item.id,
        igdbId: item.externalId ?? null,
        title: item.title,
        genre: "Unknown",
        type: "General",
        status: trackedToDashboardStatus(item.status),
        releaseYear: new Date().getUTCFullYear(),
        summary: "No description available.",
        rating: 0,
      } satisfies DashboardGame;
    }),
  );

  return detailResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}

function mergeTrackedStatuses(
  games: DashboardGame[],
  trackedItems: TrackedItemSummary[],
): DashboardGame[] {
  return mergeTrackedStatusesByExternalIdOrTitle(games, trackedItems, {
    getExternalId: (game) => game.igdbId,
    getTitle: (game) => game.title,
    setStatus: (game, status) => ({
      ...game,
      status: status as DashboardGameStatus,
    }),
    trackedToUiStatus: trackedToDashboardStatus,
  });
}

function toDashboardGame(game: TwitchIgdbGame): DashboardGame {
  const ratingOutOf10 =
    game.rating === null ? 0 : Number((game.rating / 10).toFixed(1));
  const status: DashboardGameStatus = "";

  return {
    id: game.id,
    igdbId: game.twitch?.igdbId ?? null,
    title: game.name,
    genre: game.genres[0] ?? "Unknown",
    type: game.genres[1] ?? game.genres[0] ?? "General",
    status,
    releaseYear: game.releaseDate
      ? new Date(game.releaseDate).getUTCFullYear()
      : new Date().getUTCFullYear(),
    summary: game.description ?? "No description available.",
    rating: ratingOutOf10,
  };
}

function toDashboardGameDetail(game: TwitchIgdbGame): DashboardGameDetail {
  const base = toDashboardGame(game);

  return {
    ...base,
    storyline: game.storyline ?? null,
    companies: game.companies ?? [],
    coverUrl: game.coverUrl ?? null,
  };
}

function buildGamesUrl(filters: GamesFilters) {
  const searchParams = new URLSearchParams();

  searchParams.set("first", "20");

  if (filters.query) {
    searchParams.set("q", filters.query);
  }

  const queryString = searchParams.toString();
  return queryString
    ? `/api/twitch/games/top?${queryString}`
    : "/api/twitch/games/top";
}

export async function fetchGames(
  filters: GamesFilters,
): Promise<DashboardGame[]> {
  if (filters.status && filters.status !== "All") {
    const trackedItems = await fetchTrackedItemsForGames(filters);
    const trackedGames = await mapTrackedItemsToDashboardGames(trackedItems);

    if (!filters.query) {
      return trackedGames;
    }

    const query = normalizeForCompare(filters.query);
    return trackedGames.filter((game) =>
      normalizeForCompare(game.title).includes(query),
    );
  }

  const response = await fetch(buildGamesUrl(filters));

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  const payload = (await response.json()) as TwitchIgdbGamesResponse;
  const mappedGames = payload.data.map(toDashboardGame);
  const trackedItems = await fetchTrackedItemsForGames(filters);
  return mergeTrackedStatuses(mappedGames, trackedItems);
}

export async function fetchDashboardGameDetail(
  id: string,
  igdbId?: string | null,
): Promise<DashboardGameDetail> {
  const searchParams = new URLSearchParams();

  if (igdbId) {
    searchParams.set("igdbId", igdbId);
  }

  const suffix = searchParams.toString();
  const url = suffix
    ? `/api/twitch/games/${encodeURIComponent(id)}?${suffix}`
    : `/api/twitch/games/${encodeURIComponent(id)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch game details: ${response.statusText}`);
  }

  const payload = (await response.json()) as TwitchIgdbGame;
  return toDashboardGameDetail(payload);
}
