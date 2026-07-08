import Link from "next/link";
import Image from "next/image";
import type { DashboardGame } from "@/lib/category-api";
import type { DashboardCategory } from "@/lib/dashboard-categories";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  category: DashboardCategory;
}

// ---------------------------------------------------------------------------
// GameCard — displays a single game entry in the backlog grid.
// ---------------------------------------------------------------------------
export function GameCard({ game, category }: GameCardProps) {
  const statusLabel = game.status || "Unassigned";
  const canOpenDetail = Boolean(game.igdbId);
  const query = new URLSearchParams();
  query.set("title", game.title);

  if (game.igdbId) {
    query.set("igdbId", game.igdbId);
  }

  if (game.source) {
    query.set("source", game.source);
  }

  const href = query.toString()
    ? `/dashboard/${category}/${game.id}?${query.toString()}`
    : `/dashboard/${category}/${game.id}`;
  const card = (
    <div className="group block w-65 h-full">
      <Card className="relative h-full pt-0 border-gray-700/60 bg-gray-900 transition-all duration-200 group-hover:border-purple-500/60 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <div className="relative min-h-45 mt-1.5 mx-1.5 overflow-hidden rounded-t-xl border-b border-gray-800/70 bg-gray-950">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={`${game.title} cover art`}
              fill
              className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-gray-800 via-gray-900 to-black px-4 text-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
                No Cover Available
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-gray-900/85 via-gray-900/20 to-transparent" />
        </div>

        <CardHeader>
          <TooltipProvider delay={400}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="block w-full max-w-full overflow-hidden" />
                }
              >
                <CardTitle className="block font-mono text-base font-bold text-white leading-tight group-hover:text-purple-300 transition-colors whitespace-nowrap truncate overflow-hidden max-w-full">
                  {game.title}
                </CardTitle>
              </TooltipTrigger>

              <TooltipContent className="bg-gray-900 border border-cyan-300/60 text-purple-300 font-mono text-xs">
                <p>{game.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="text-xs text-gray-500 font-mono mt-1 h-12.5 line-clamp-3 overflow-hidden">
            {shortenText(game.summary, 110)}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col h-full gap-3">
          <Separator className="bg-gray-800" />

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] uppercase tracking-wide font-mono">
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
          </dl>

          <div
            className="mt-auto flex gap-2 pt-1 overflow-x-auto scrollbar-arcade
           [&::-webkit-scrollbar]:h-1.5 h-10"
          >
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
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}
