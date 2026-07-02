export type DashboardGameStatus = "" | "Backlog" | "Playing" | "Completed";

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
  status?: DashboardGameStatus | "All";
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
  const response = await fetch(buildGamesUrl(filters));

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  const payload = (await response.json()) as TwitchIgdbGamesResponse;
  const mappedGames = payload.data.map(toDashboardGame);

  if (!filters.status || filters.status === "All") {
    return mappedGames;
  }

  return mappedGames.filter((game) => game.status === filters.status);
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
