import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string;
  release_date: string | null;
  vote_average: number;
  poster_path: string | null;
  genre_ids: number[];
}

interface TmdbTopRatedResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbGenresResponse {
  genres: TmdbGenre[];
}

function buildTmdbImageUrl(path: string | null, size: "w500" | "original") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function readTmdbApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim() ?? "";

  if (!apiKey) {
    throw new Error(
      "Missing TMDB API key. Set NEXT_PUBLIC_TMDB_API_KEY in your .env.",
    );
  }

  return apiKey;
}

function clampFirst(rawValue: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), max);
}

async function fetchGenresMap(apiKey: string) {
  const genreResponse = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${encodeURIComponent(apiKey)}&language=en-US`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!genreResponse.ok) {
    const errorBody = await genreResponse.text();
    throw new Error(`Failed to fetch TMDB genres: ${errorBody}`);
  }

  const payload = (await genreResponse.json()) as TmdbGenresResponse;
  return new Map(payload.genres.map((genre) => [genre.id, genre.name]));
}

function mapMovieResult(
  movie: TmdbMovieResult,
  genresMap: Map<number, string>,
) {
  const genres = movie.genre_ids
    .map((genreId) => genresMap.get(genreId))
    .filter((genre): genre is string => Boolean(genre));

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    voteAverage: Number(movie.vote_average.toFixed(1)),
    coverUrl: buildTmdbImageUrl(movie.poster_path, "w500"),
    genres,
  };
}

export async function GET(request: Request) {
  try {
    const apiKey = readTmdbApiKey();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const first = clampFirst(searchParams.get("first"), 20, 20);

    const baseUrl = query
      ? "https://api.themoviedb.org/3/search/movie"
      : "https://api.themoviedb.org/3/movie/top_rated";

    const endpointUrl = new URL(baseUrl);
    endpointUrl.searchParams.set("api_key", apiKey);
    endpointUrl.searchParams.set("language", "en-US");
    endpointUrl.searchParams.set("page", "1");

    if (query) {
      endpointUrl.searchParams.set("query", query);
      endpointUrl.searchParams.set("include_adult", "false");
    }

    const response = await fetch(endpointUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();

      return NextResponse.json(
        {
          message: "Failed to fetch data from TMDB.",
          status: response.status,
          details: errorBody,
        },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as
      | TmdbTopRatedResponse
      | TmdbSearchResponse;
    const genresMap = await fetchGenresMap(apiKey);
    const movies = payload.results
      .slice(0, first)
      .map((movie) => mapMovieResult(movie, genresMap));

    return NextResponse.json({
      source: query ? "tmdb-search" : "tmdb-top-rated",
      query,
      data: movies,
      page: payload.page,
      totalPages: payload.total_pages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
