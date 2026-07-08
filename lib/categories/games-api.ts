import {
  normalizeForCompare,
  type TrackedItemSummary,
} from "@/lib/tracker-client";
import {
  fetchTrackedItemsForCategory,
  mergeTrackedStatusesForCategory,
  toFallbackDashboardGame,
  trackedToDashboardStatus,
  type DashboardGame,
  type DashboardGameDetail,
  type GamesFilters,
} from "@/lib/category-api-core";

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

function toDashboardGame(game: TwitchIgdbGame): DashboardGame {
  const ratingOutOf10 =
    game.rating === null ? 0 : Number((game.rating / 10).toFixed(1));

  return {
    id: game.id,
    igdbId: game.twitch?.igdbId ?? null,
    source: "IGDB",
    coverUrl: game.coverUrl ?? null,
    title: game.name,
    genre: game.genres[0] ?? "Unknown",
    type: game.genres[1] ?? game.genres[0] ?? "General",
    status: "",
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
          source: "IGDB",
          title: item.title || detail.title,
          status: trackedToDashboardStatus(item.status),
        } satisfies DashboardGame;
      }

      return toFallbackDashboardGame(item);
    }),
  );

  return detailResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}

export async function fetchGames(
  filters: GamesFilters,
): Promise<DashboardGame[]> {
  if (filters.status && filters.status !== "All") {
    const trackedItems = await fetchTrackedItemsForCategory("games", filters);
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
  const trackedItems = await fetchTrackedItemsForCategory("games", filters);
  return mergeTrackedStatusesForCategory(mappedGames, trackedItems, "games");
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
