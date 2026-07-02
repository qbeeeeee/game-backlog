import Link from "next/link";
import type { DashboardGame } from "@/lib/game-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Status badge colour map
const STATUS_COLOURS: Record<DashboardGame["status"], string> = {
  "": "bg-gray-900/80 text-gray-300 border-gray-700/50",
  Backlog: "bg-gray-800/80 text-gray-400 border-gray-600/50",
  Playing: "bg-cyan-900/60 text-cyan-300 border-cyan-500/50",
  Completed: "bg-emerald-900/60 text-emerald-300 border-emerald-500/50",
};

// Status icon map
const STATUS_ICONS: Record<DashboardGame["status"], string> = {
  "": "•",
  Backlog: "⏳",
  Playing: "▶",
  Completed: "✔",
};

function formatReleaseDate(year: number) {
  return `Jan 1, ${year}`;
}

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

interface GameCardProps {
  game: DashboardGame;
}

// ---------------------------------------------------------------------------
// GameCard — displays a single game entry in the backlog grid.
// ---------------------------------------------------------------------------
export function GameCard({ game }: GameCardProps) {
  const statusLabel = game.status || "Unassigned";
  const canOpenDetail = Boolean(game.igdbId);
  const query = new URLSearchParams();

  if (game.igdbId) {
    query.set("igdbId", game.igdbId);
  }

  const href = query.toString()
    ? `/dashboard/${game.id}?${query.toString()}`
    : `/dashboard/${game.id}`;
  const card = (
    <div className="group block h-full max-h-75">
      <Card className="relative h-full border-gray-700/60 bg-gray-900 transition-all duration-200 group-hover:border-purple-500/60 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <CardHeader>
          <CardTitle className="font-mono text-base font-bold text-white leading-tight group-hover:text-purple-300 transition-colors">
            {game.title}
          </CardTitle>

          <p className="text-xs text-gray-500 font-mono mt-1 h-[50px] line-clamp-3 overflow-hidden">
            {shortenText(game.summary, 110)}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col h-full gap-3">
          <Separator className="bg-gray-800" />

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] uppercase tracking-wide font-mono">
            {/* <div>
              <dt className="text-gray-600">Status</dt>
              <dd className="mt-1 text-gray-200">{statusLabel}</dd>
            </div> */}
            <div>
              <dt className="text-gray-600">Rating</dt>
              <dd className="mt-1 text-cyan-300">
                {game.rating > 0 ? `${game.rating}/10` : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Release Year</dt>
              <dd className="mt-1 text-cyan-300">{game.releaseYear}</dd>
            </div>
            {/* <div>
              <dt className="text-gray-600">Genre</dt>
              <dd className="mt-1 text-gray-200">{game.genre}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-600">Type</dt>
              <dd className="mt-1 text-gray-200">{game.type ?? game.genre}</dd>
            </div> */}
          </dl>

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Badge
              variant="outline"
              className={`text-[11px] font-mono uppercase tracking-wider ${STATUS_COLOURS[game.status]}`}
            >
              <span aria-hidden="true">{STATUS_ICONS[game.status]}</span>
              {statusLabel}
            </Badge>
            {game.type && game.type !== "Unknown" && (
              <Badge
                variant="outline"
                className="text-[11px] font-mono uppercase tracking-wider bg-purple-500 border-purple-600/50 text-white"
              >
                {game.type}
              </Badge>
            )}
            {game.genre && game.genre !== "Unknown" && (
              <Badge
                variant="outline"
                className="text-[11px] font-mono uppercase tracking-wider bg-cyan-500 border-cyan-600/50 text-white"
              >
                {game.genre}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!canOpenDetail) {
    return card;
  }

  return (
    <Link href={href} className="block h-full max-h-75">
      {card}
    </Link>
  );
}
