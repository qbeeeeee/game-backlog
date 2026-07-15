import {
  normalizeForCompare,
  type TrackedItemSummary,
} from "@/lib/tracker/client";
import {
  fetchTrackedItemsForCategory,
  mergeTrackedStatusesForCategory,
  toFallbackDashboardGame,
  trackedToDashboardStatus,
  type DashboardGame,
  type DashboardGameDetail,
  type GamesFilters,
} from "@/lib/category-api-core";

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string | null;
  runtimeMinutes?: number | null;
  voteAverage: number;
  coverUrl?: string | null;
  genres: string[];
  cast?: string[];
  productionCompanies?: string[];
}

interface TmdbMoviesResponse {
  source: "tmdb-top-rated" | "tmdb-search";
  query?: string;
  data: TmdbMovie[];
}

function toDashboardMovie(movie: TmdbMovie): DashboardGame {
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getUTCFullYear()
    : new Date().getUTCFullYear();

  return {
    id: String(movie.id),
    igdbId: String(movie.id),
    source: "TMDB",
    coverUrl: movie.coverUrl ?? null,
    title: movie.title,
    genre: movie.genres[0] ?? "Unknown",
    type: movie.genres[1] ?? movie.genres[0] ?? "General",
    status: "",
    releaseYear,
    summary: movie.overview || "No description available.",
    rating: Number(movie.voteAverage.toFixed(1)),
  };
}

function toDashboardMovieDetail(movie: TmdbMovie): DashboardGameDetail {
  return {
    ...toDashboardMovie(movie),
    storyline: null,
    companies: movie.productionCompanies ?? [],
    cast: movie.cast ?? [],
    runtimeMinutes: movie.runtimeMinutes ?? null,
    coverUrl: movie.coverUrl ?? null,
  };
}

function buildMoviesUrl(filters: GamesFilters) {
  const searchParams = new URLSearchParams();

  searchParams.set("first", "20");

  if (filters.query) {
    searchParams.set("q", filters.query);
  }

  const queryString = searchParams.toString();
  return queryString
    ? `/api/tmdb/movies/top?${queryString}`
    : "/api/tmdb/movies/top";
}

async function mapTrackedItemsToDashboardMovies(
  trackedItems: TrackedItemSummary[],
): Promise<DashboardGame[]> {
  const detailResults = await Promise.allSettled(
    trackedItems.map(async (item) => {
      if (item.source === "TMDB" && item.externalId) {
        const detail = await fetchDashboardMovieDetail(item.externalId);

        return {
          ...detail,
          id: item.externalId,
          igdbId: item.externalId,
          source: "TMDB",
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

export async function fetchMovies(
  filters: GamesFilters,
): Promise<DashboardGame[]> {
  if (filters.status && filters.status !== "All") {
    const trackedItems = await fetchTrackedItemsForCategory("movies", filters);
    const trackedMovies = await mapTrackedItemsToDashboardMovies(trackedItems);

    if (!filters.query) {
      return trackedMovies;
    }

    const query = normalizeForCompare(filters.query);
    return trackedMovies.filter((movie) =>
      normalizeForCompare(movie.title).includes(query),
    );
  }

  const response = await fetch(buildMoviesUrl(filters));

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const payload = (await response.json()) as TmdbMoviesResponse;
  const mappedMovies = payload.data.map(toDashboardMovie);
  const trackedItems = await fetchTrackedItemsForCategory("movies", filters);
  return mergeTrackedStatusesForCategory(mappedMovies, trackedItems, "movies");
}

export async function fetchDashboardMovieDetail(
  movieId: string,
): Promise<DashboardGameDetail> {
  const response = await fetch(
    `/api/tmdb/movies/${encodeURIComponent(movieId)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch movie details: ${response.statusText}`);
  }

  const payload = (await response.json()) as TmdbMovie;
  return toDashboardMovieDetail(payload);
}
