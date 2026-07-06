import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TmdbMovieGenre {
  id: number;
  name: string;
}

interface TmdbProductionCompany {
  id: number;
  name: string;
}

interface TmdbMovieDetailResponse {
  id: number;
  title: string;
  overview: string;
  release_date: string | null;
  vote_average: number;
  poster_path: string | null;
  genres: TmdbMovieGenre[];
  production_companies: TmdbProductionCompany[];
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const apiKey = readTmdbApiKey();
    const { id } = await context.params;

    const endpointUrl = new URL(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}`,
    );
    endpointUrl.searchParams.set("api_key", apiKey);
    endpointUrl.searchParams.set("language", "en-US");

    const response = await fetch(endpointUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();

      return NextResponse.json(
        {
          message: "Failed to fetch movie details from TMDB.",
          status: response.status,
          details: errorBody,
        },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as TmdbMovieDetailResponse;

    return NextResponse.json({
      id: payload.id,
      title: payload.title,
      overview: payload.overview,
      releaseDate: payload.release_date,
      voteAverage: Number(payload.vote_average.toFixed(1)),
      coverUrl: buildTmdbImageUrl(payload.poster_path, "w500"),
      genres: payload.genres.map((genre) => genre.name),
      productionCompanies: payload.production_companies.map(
        (company) => company.name,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
