"use client";

/**
 * DashboardContent
 * ----------------
 * Client Component — uses TanStack Query's useQuery to fetch games from our
 * local API route, then renders summary metrics, filter buttons, and the game
 * card grid.  Must be wrapped with <QueryProvider> to have access to a
 * QueryClient (handled by the parent dashboard/layout.tsx).
 */

import { useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCategoryItems, gameKeys } from "@/lib/category-api";
import type { DashboardGame } from "@/lib/category-api";
import { GameCard } from "@/components/dashboard/GameCard";
import { SkeletonLoader } from "@/components/dashboard/SkeletonLoader";
import { StatusFilterBar } from "@/components/dashboard/StatusFilterBar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DASHBOARD_CATEGORY_META,
  type DashboardCategory,
} from "@/lib/dashboard-categories";
import {
  getStatusMetricLabel,
  parseStatusFilterParam,
  type DashboardStatusFilter,
} from "@/lib/dashboard-category-ui";

// ---------------------------------------------------------------------------
// Stat metric card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className={`bg-gray-900/90 ${accent}`}>
      <CardContent className="flex flex-col gap-1">
        <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
          {label}
        </p>
        <p className="text-3xl font-bold font-mono text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function ResultsAreaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          aria-hidden="true"
        >
          <Skeleton className="h-4 w-3/4 bg-gray-800" />
          <Skeleton className="mt-3 h-3 w-1/2 bg-gray-800/70" />
          <div className="mt-8 flex gap-2">
            <Skeleton className="h-5 w-16 bg-gray-800" />
            <Skeleton className="h-5 w-20 bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard content component
// ---------------------------------------------------------------------------
export function DashboardContent({
  category,
}: {
  category: DashboardCategory;
}) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const queryParam = searchParams.get("q") ?? "";
  const categoryLabel = DASHBOARD_CATEGORY_META[category].label;
  const singularCategoryLabel = categoryLabel.endsWith("s")
    ? categoryLabel.slice(0, -1)
    : categoryLabel;

  const activeFilter: DashboardStatusFilter = parseStatusFilterParam(statusParam);

  const {
    data: games,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery<DashboardGame[], Error>({
    queryKey: gameKeys.list(
      { status: activeFilter, query: queryParam },
      category,
    ),
    queryFn: () =>
      fetchCategoryItems(category, {
        status: activeFilter,
        query: queryParam,
      }),
    placeholderData: keepPreviousData,
  });

  // First dashboard visit: show page-level skeleton while initial data loads.
  if (isPending && !games) {
    return <SkeletonLoader />;
  }

  // --- Error state ---
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 font-mono text-center">
        <span className="text-5xl" aria-hidden="true">
          💥
        </span>
        <p className="text-red-400 text-lg tracking-wide uppercase">
          GAME OVER — Failed to load {categoryLabel.toLowerCase()}
        </p>
        <p className="text-gray-500 text-sm">{error?.message}</p>
      </div>
    );
  }

  const safeGames = games ?? [];
  const isResultsRefreshing = isFetching && !!games;

  const totalGames = safeGames.length;
  const backlogCount = safeGames.filter((g) => g.status === "Backlog").length;
  const playingCount = safeGames.filter((g) => g.status === "Playing").length;
  const completedCount = safeGames.filter(
    (g) => g.status === "Completed",
  ).length;

  return (
    <div className="flex flex-col gap-8 min-h-screen w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Summary Metrics                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Summary metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={`Total ${categoryLabel}`}
            value={totalGames}
            accent="border-gray-700/60"
          />
          <StatCard
            label={getStatusMetricLabel(category, "Backlog")}
            value={backlogCount}
            accent="border-gray-600/60"
          />
          <StatCard
            label={getStatusMetricLabel(category, "Playing")}
            value={playingCount}
            accent="border-cyan-800/60"
          />
          <StatCard
            label={getStatusMetricLabel(category, "Completed")}
            value={completedCount}
            accent="border-emerald-800/60"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Filter Controls                                                      */}
      {/* ------------------------------------------------------------------ */}
      <StatusFilterBar
        category={category}
        currentFilter={activeFilter}
        currentQuery={queryParam}
      />

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-gray-800/70 bg-gray-950/60">
          <CardHeader>
            <CardTitle className="text-[10px] uppercase tracking-[0.24em] text-gray-600">
              React Query cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-7 text-gray-300">
              The list query key includes both{" "}
              <span className="font-semibold text-cyan-300">status</span> and{" "}
              <span className="font-semibold text-cyan-300">q</span>, so each
              filtered result is cached separately.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="border-gray-800/70 bg-gray-950/60">
          <CardHeader>
            <CardTitle className="text-[10px] uppercase tracking-[0.24em] text-gray-600">
              Next App Router
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-7 text-gray-300">
              Filter state lives in the URL, detail pages live at dynamic
              routes, and API handlers sit under app/api.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Game Card Grid                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Game backlog grid">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.26em] text-gray-600">
            {safeGames.length} result{safeGames.length !== 1 ? "s" : ""}
          </p>
          <p className="text-[11px] uppercase tracking-[0.26em] text-gray-700">
            {isFetching
              ? "Updating results..."
              : "Open any card to inspect the dynamic route and mutation flow"}
          </p>
        </div>
        <div className="relative" aria-live="polite" aria-busy={isFetching}>
          {safeGames.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 font-mono text-center">
              <span className="text-4xl" aria-hidden="true">
                🕹️
              </span>
              <p className="text-gray-600 text-sm uppercase tracking-widest">
                No {singularCategoryLabel.toLowerCase()} in this category
              </p>
            </div>
          ) : !isResultsRefreshing ? (
            <div
              className="flex flex-wrap justify-around gap-4 p-0"
              aria-label="Games list"
            >
              {safeGames.map((game) => (
                <GameCard key={game.id} game={game} category={category} />
              ))}
            </div>
          ) : (
            <div className="h-100" />
          )}

          {isResultsRefreshing && (
            <div className="absolute inset-0 z-10 rounded-xl bg-gray-950/85 p-2">
              <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-cyan-400">
                Loading filtered results...
              </p>
              <ResultsAreaSkeleton />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
