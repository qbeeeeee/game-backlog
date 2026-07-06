"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardCategoryDetail, gameKeys } from "@/lib/category-api";
import type { DashboardCategory } from "@/lib/dashboard-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface GameDetailContentProps {
  gameId: string;
  category: DashboardCategory;
}

function DetailSkeleton() {
  return (
    <Card className="rounded-3xl border-gray-800 bg-gray-950/80">
      <CardContent className="animate-pulse">
        <Skeleton className="mb-4 h-4 w-28 bg-gray-800" />
        <Skeleton className="mb-3 h-10 w-2/3 bg-gray-800" />
        <Skeleton className="mb-8 h-20 w-full bg-gray-900" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-2xl bg-gray-900" />
          <Skeleton className="h-20 rounded-2xl bg-gray-900" />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-gray-800 bg-black/40">
      <CardContent>
        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-600">
          {label}
        </p>
        <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

export function GameDetailContent({
  gameId,
  category,
}: GameDetailContentProps) {
  const searchParams = useSearchParams();
  const externalId = searchParams.get("igdbId");

  const {
    data: game,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: gameKeys.detail(gameId, externalId, category),
    queryFn: () => fetchDashboardCategoryDetail(category, gameId, externalId),
  });

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !game) {
    return (
      <Card className="rounded-3xl border-red-900/60 bg-red-950/20">
        <CardContent className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-red-300">
            Game data unavailable
          </p>
          <p className="mt-3 text-sm text-red-200/80">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            variant="outline"
            className="mt-6 border-red-500/50 text-red-200 hover:bg-red-950/50"
            render={<Link href={`/dashboard/${category}`} />}
          >
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-gray-800 bg-gray-950/80 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
      <CardContent>
        <div className="flex gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="text-[11px] uppercase tracking-[0.28em] text-cyan-300 border-cyan-500/40"
            >
              Live detail
            </Badge>
            <h1 className="mt-3 text-4xl font-bold uppercase tracking-[0.08em] text-white">
              {game.title}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-gray-600">
              Description
            </p>
            <p className="mt-2 text-sm leading-7 text-gray-300 overflow-y-auto max-h-40 scrollbar-arcade pr-4">
              {game.summary}
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-gray-600">
              Story Line
            </p>
            {game.storyline ? (
              <p className="mt-2 text-sm leading-7 text-gray-300 overflow-y-auto max-h-40 scrollbar-arcade pr-4">
                {game.storyline}
              </p>
            ) : null}
          </div>

          <div className="relative w-full max-w-40 overflow-hidden rounded-2xl aspect-3/4 bg-gray-900">
            {game.coverUrl ? (
              <Image
                src={game.coverUrl}
                alt={`${game.title} cover`}
                fill
                sizes="(max-width: 640px) 70vw, 160px"
                className="object-contain"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-gray-800" />
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Type" value={game.type ?? "General"} />
          <InfoTile label="Genre" value={game.genre} />
          <InfoTile label="Release" value={game.releaseYear} />
          <InfoTile label="Rating" value={`${game.rating}/10`} />
        </div>

        <Card className="mt-8 border-gray-800 bg-black/30">
          <CardHeader>
            <CardTitle className="text-[10px] uppercase tracking-[0.24em] text-gray-600">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-7 text-gray-300">
              {game.companies.length > 0
                ? game.companies.join(", ")
                : "No company info available for this game."}
            </CardDescription>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
