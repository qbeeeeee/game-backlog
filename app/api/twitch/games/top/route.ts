import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchTopGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id?: string;
}

interface TwitchTopGamesResponse {
  data: TwitchTopGame[];
  pagination?: {
    cursor?: string;
  };
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

function clampFirst(rawValue: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), max);
}

function escapeIgdbSearchQuery(query: string) {
  return query.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeIgdbCoverUrl(
  url: string | undefined,
  twitchBoxArtUrl: string,
) {
  if (!url) {
    return twitchBoxArtUrl.replace("{width}", "285").replace("{height}", "380");
  }

  const withProtocol = url.startsWith("//") ? `https:${url}` : url;
  return withProtocol.replace("t_thumb", "t_cover_big");
}

async function fetchIgdbGames(
  accessToken: string,
  clientId: string,
  body: string,
) {
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
      data: null,
    };
  }

  const data = (await response.json()) as IgdbGame[];
  return {
    ok: true as const,
    status: response.status,
    errorBody: null,
    data,
  };
}

function toGamePayload(game: TwitchTopGame, igdbGame: IgdbGame | null) {
  const releaseDate = igdbGame?.first_release_date
    ? new Date(igdbGame.first_release_date * 1000).toISOString()
    : null;

  return {
    id: game.id,
    name: game.name,
    twitch: {
      id: game.id,
      boxArtUrl: game.box_art_url,
      igdbId: game.igdb_id ?? null,
    },
    description: igdbGame?.summary ?? igdbGame?.storyline ?? null,
    releaseDate,
    summary: igdbGame?.summary ?? null,
    storyline: igdbGame?.storyline ?? null,
    rating: igdbGame?.rating ?? null,
    aggregatedRating: igdbGame?.aggregated_rating ?? null,
    genres: igdbGame?.genres?.map((genre) => genre.name).filter(Boolean) ?? [],
    companies:
      igdbGame?.involved_companies
        ?.map((entry) => entry.company?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    coverUrl: normalizeIgdbCoverUrl(igdbGame?.cover?.url, game.box_art_url),
  };
}

function toSearchPayload(game: IgdbGame) {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toISOString()
    : null;

  return {
    id: String(game.id),
    name: game.name,
    twitch: {
      id: null,
      boxArtUrl: null,
      igdbId: String(game.id),
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
    coverUrl: game.cover?.url
      ? normalizeIgdbCoverUrl(game.cover.url, "")
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const first = clampFirst(searchParams.get("first"), 20, 100);
    const after = searchParams.get("after");

    const accessToken = await getTwitchAppAccessToken();
    const { clientId } = readTwitchCredentials();

    if (query) {
      const escapedQuery = escapeIgdbSearchQuery(query);
      const igdbQueryBody = `search "${escapedQuery}"; fields id, name, first_release_date, summary, storyline, rating, aggregated_rating, cover.url, genres.name, involved_companies.company.name; limit ${first};`;
      const igdbResponse = await fetchIgdbGames(
        accessToken,
        clientId,
        igdbQueryBody,
      );

      if (!igdbResponse.ok) {
        return NextResponse.json(
          {
            message: "Failed to fetch data from IGDB.",
            status: igdbResponse.status,
            details: igdbResponse.errorBody,
          },
          { status: igdbResponse.status },
        );
      }

      return NextResponse.json({
        source: "igdb-search",
        query,
        data: igdbResponse.data.map(toSearchPayload),
      });
    }

    const endpointUrl = new URL("https://api.twitch.tv/helix/games/top");
    endpointUrl.searchParams.set("first", String(first));

    if (after) {
      endpointUrl.searchParams.set("after", after);
    }

    const twitchResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
      cache: "no-store",
    });

    if (!twitchResponse.ok) {
      const errorBody = await twitchResponse.text();

      return NextResponse.json(
        {
          message: "Failed to fetch data from Twitch.",
          status: twitchResponse.status,
          details: errorBody,
        },
        { status: twitchResponse.status },
      );
    }

    const twitchData = (await twitchResponse.json()) as TwitchTopGamesResponse;
    const igdbIds = twitchData.data
      .map((game) => Number.parseInt(game.igdb_id ?? "", 10))
      .filter((id) => Number.isFinite(id));

    if (igdbIds.length === 0) {
      return NextResponse.json({
        source: "twitch-top",
        data: twitchData.data.map((game) => toGamePayload(game, null)),
        pagination: twitchData.pagination ?? {},
      });
    }

    const igdbQueryBody = `fields id, name, first_release_date, summary, storyline, rating, aggregated_rating, cover.url, genres.name, involved_companies.company.name; where id = (${igdbIds.join(",")}); limit ${igdbIds.length};`;
    const igdbResponse = await fetchIgdbGames(
      accessToken,
      clientId,
      igdbQueryBody,
    );

    if (!igdbResponse.ok) {
      return NextResponse.json(
        {
          message: "Failed to enrich top games with IGDB data.",
          status: igdbResponse.status,
          details: igdbResponse.errorBody,
        },
        { status: igdbResponse.status },
      );
    }

    const igdbById = new Map(igdbResponse.data.map((game) => [game.id, game]));
    const mergedGames = twitchData.data.map((game) => {
      const igdbId = Number.parseInt(game.igdb_id ?? "", 10);
      const igdbGame = Number.isFinite(igdbId)
        ? (igdbById.get(igdbId) ?? null)
        : null;

      return toGamePayload(game, igdbGame);
    });

    return NextResponse.json({
      source: "twitch-top",
      data: mergedGames,
      pagination: twitchData.pagination ?? {},
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
