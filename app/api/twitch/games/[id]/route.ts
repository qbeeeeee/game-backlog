import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface IgdbGenre {
  name: string;
}

interface IgdbCompany {
  company?: {
    name?: string;
  };
}

interface IgdbGame {
  id: number;
  name: string;
  first_release_date?: number;
  summary?: string;
  storyline?: string;
  rating?: number;
  aggregated_rating?: number;
  cover?: {
    url?: string;
  };
  genres?: IgdbGenre[];
  involved_companies?: IgdbCompany[];
}

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

function readTwitchCredentials() {
  const clientId = process.env.TWITCH_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.TWITCH_SECRET?.trim() ?? "";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Twitch credentials. Set TWITCH_CLIENT_ID and TWITCH_SECRET in your .env.",
    );
  }

  return { clientId, clientSecret };
}

async function getTwitchAppAccessToken() {
  const now = Date.now();

  if (cachedAccessToken && now < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const { clientId, clientSecret } = readTwitchCredentials();
  const tokenUrl = new URL("https://id.twitch.tv/oauth2/token");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("grant_type", "client_credentials");

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to retrieve Twitch access token.");
  }

  const tokenData = (await tokenResponse.json()) as TwitchTokenResponse;
  cachedAccessToken = tokenData.access_token;
  cachedAccessTokenExpiresAt =
    now + Math.max(tokenData.expires_in - 60, 1) * 1000;

  return cachedAccessToken;
}

function normalizeIgdbCoverUrl(url: string | undefined) {
  if (!url) {
    return null;
  }

  const withProtocol = url.startsWith("//") ? `https:${url}` : url;
  return withProtocol.replace("t_thumb", "t_cover_big");
}

async function fetchIgdbGameById(
  id: number,
  accessToken: string,
  clientId: string,
) {
  const body = `fields id, name, first_release_date, summary, storyline, rating, aggregated_rating, cover.url, genres.name, involved_companies.company.name; where id = (${id}); limit 1;`;

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
      "Content-Type": "text/plain",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return {
      ok: false as const,
      status: response.status,
      errorBody,
      game: null,
    };
  }

  const data = (await response.json()) as IgdbGame[];
  return {
    ok: true as const,
    status: response.status,
    errorBody: null,
    game: data[0] ?? null,
  };
}

function toDetailPayload(id: string, igdbId: string | null, game: IgdbGame) {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toISOString()
    : null;

  return {
    id,
    name: game.name,
    twitch: {
      id,
      boxArtUrl: null,
      igdbId,
    },
    description: game.summary ?? game.storyline ?? null,
    releaseDate,
    summary: game.summary ?? null,
    storyline: game.storyline ?? null,
    rating: game.rating ?? null,
    aggregatedRating: game.aggregated_rating ?? null,
    genres: game.genres?.map((genre) => genre.name).filter(Boolean) ?? [],
    companies:
      game.involved_companies
        ?.map((entry) => entry.company?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    coverUrl: normalizeIgdbCoverUrl(game.cover?.url),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const igdbIdParam = searchParams.get("igdbId")?.trim();
    const numericId = Number.parseInt(igdbIdParam ?? id, 10);

    if (!Number.isFinite(numericId)) {
      return NextResponse.json(
        { message: "Missing valid igdbId for game detail fetch." },
        { status: 400 },
      );
    }

    const accessToken = await getTwitchAppAccessToken();
    const { clientId } = readTwitchCredentials();

    const detailResponse = await fetchIgdbGameById(
      numericId,
      accessToken,
      clientId,
    );

    if (!detailResponse.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch game details from IGDB.",
          status: detailResponse.status,
          details: detailResponse.errorBody,
        },
        { status: detailResponse.status },
      );
    }

    if (!detailResponse.game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    const payload = toDetailPayload(id, String(numericId), detailResponse.game);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
