"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  DASHBOARD_MEDIA_TYPE_BY_CATEGORY,
  type DashboardCategory,
} from "@/lib/dashboard/categories";
import {
  getStatusLabel,
  getStatusFilterOptions,
  type DashboardStatusFilter,
} from "@/lib/dashboard/category-ui";
import { Button } from "../ui/button";
import {
  DashboardAssignableStatus,
  DashboardTrackedItemStatus,
  trackedToDashboardStatus,
} from "@/lib/category-api";

// Update the type to match our UI categories
type SelectedCategory = DashboardCategory | "all";

// Define the shape of the new items we are fetching
interface TrackedItemDto {
  id: string;
  title: string;
  status: string; // From Prisma: BACKLOG, IN_PROGRESS, COMPLETED, PAUSED, DROPPED
  mediaType: string; // From Prisma: GAME, MOVIE, SERIES, ANIME, YOUTUBE
  updatedAt: string;
}

interface TrackedStats {
  total: number;
  completed: number;
  completionRate: number;
  byStatus: Array<{ status: string; count: number }>;
  byMediaType: Array<{ mediaType: string; count: number }>;
  items: TrackedItemDto[];
}

// Helper to find the frontend category based on backend mediaType (for the "All" view)
function getCategoryFromMediaType(mediaType: string): DashboardCategory {
  const entry = Object.entries(DASHBOARD_MEDIA_TYPE_BY_CATEGORY).find(
    ([, val]) => val === mediaType,
  );
  return (entry ? entry[0] : "games") as DashboardCategory;
}

export function ProfileOverviewContent() {
  const [category, setCategory] = useState<SelectedCategory>("all");
  const [activeFilter, setActiveFilter] =
    useState<DashboardStatusFilter>("All");

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<TrackedStats>({
    queryKey: ["tracker-stats", category],
    queryFn: async () => {
      // Map the UI category to the API's expected mediaType
      const apiMediaType =
        category === "all" ? null : DASHBOARD_MEDIA_TYPE_BY_CATEGORY[category];

      const url =
        category === "all"
          ? "/api/tracker/stats"
          : `/api/tracker/stats?mediaType=${apiMediaType}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tracker stats");

      const json = await res.json();
      return json.data ?? json;
    },
  });

  // If viewing "All", default the filter terminology to games (Backlog/Playing/Completed)
  const filterCategory = category === "all" ? "games" : category;
  const dynamicFilterOptions = getStatusFilterOptions(filterCategory);

  // Filter items based on the active state
  const filteredItems = stats?.items
    ? stats.items.filter((item) => {
        if (activeFilter === "All") return true;

        // Convert the database status to our UI status, then compare it to the filter
        const uiStatus = trackedToDashboardStatus(
          item.status as DashboardTrackedItemStatus,
        );
        return uiStatus === activeFilter;
      })
    : [];

  return (
    <div className="flex flex-col gap-8 min-h-screen w-full">
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-[0.2em] text-white">
            Overview
          </h2>
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mt-1">
            A summary of your tracked media.
          </p>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Category filter"
        >
          {[
            { value: "all", label: "All" },
            { value: "games", label: "Games" },
            { value: "movies", label: "Movies" },
            { value: "series", label: "Series" },
            { value: "animes", label: "Anime" },
            { value: "youtube", label: "YouTube" },
          ].map((option) => {
            const isActive = category === option.value;

            return (
              <Button
                key={option.value}
                onClick={() => {
                  setCategory(option.value as SelectedCategory);
                  setActiveFilter("All"); // Reset sub-filter when changing main category
                }}
                aria-pressed={isActive}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`text-xs font-mono font-semibold uppercase cursor-pointer tracking-widest ${
                  isActive
                    ? "bg-purple-600/80 text-white hover:bg-purple-500"
                    : "border-gray-700 bg-transparent text-gray-300 hover:border-gray-500"
                }`}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 font-mono text-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Loading statistics...
          </p>
        </div>
      ) : isError || !stats ? (
        <div className="text-red-400 bg-red-950/20 p-4 rounded-md border border-red-900/50 font-mono text-xs uppercase tracking-wider">
          Failed to load statistics. Please make sure you are logged in.
        </div>
      ) : (
        <>
          {/* STATS GRID */}
          <section aria-label="Summary statistics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="bg-gray-900/90 border border-cyan-300/30">
                <CardContent className="flex flex-col gap-1 p-6">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                    Total Tracked
                  </p>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.total}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/90 border border-cyan-300/30">
                <CardContent className="flex flex-col gap-1 p-6">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                    Completed
                  </p>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.completed}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/90 border border-cyan-300/30">
                <CardContent className="flex flex-col gap-1 p-6">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                    Completion Rate
                  </p>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.completionRate}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ITEMS LIST */}
          <section aria-label="Recent activity items" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/70 pb-3 gap-4">
              <h3 className="text-[11px] uppercase tracking-[0.26em] text-gray-600 whitespace-nowrap">
                Recent Items
              </h3>

              {/* DYNAMIC STATUS FILTERS */}
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter items by status"
              >
                {dynamicFilterOptions.map((option) => {
                  const isActive = activeFilter === option.value;

                  return (
                    <Button
                      key={option.value}
                      onClick={() =>
                        setActiveFilter(option.value as DashboardStatusFilter)
                      }
                      aria-pressed={isActive}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={`h-7 px-3 text-[10px] font-mono font-semibold uppercase cursor-pointer tracking-widest transition-colors ${
                        isActive
                          ? "bg-purple-600/80 text-white hover:bg-purple-500 border-transparent"
                          : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 font-mono text-center">
                <span className="text-4xl" aria-hidden="true">
                  🔍
                </span>
                <p className="text-gray-600 text-sm uppercase tracking-widest">
                  No items match this filter
                </p>
              </div>
            ) : (
              <div className="grid gap-3 overflow-y-auto max-h-150 scrollbar-arcade pr-3">
                {filteredItems.map((item) => {
                  // If we are in "All", determine the specific category for THIS item
                  // so the status label reads correctly (e.g. "Seen" for movies, "Completed" for games)
                  const itemCategory =
                    category === "all"
                      ? getCategoryFromMediaType(item.mediaType)
                      : category;

                  const uiStatus = trackedToDashboardStatus(
                    item.status as DashboardTrackedItemStatus,
                  );
                  const displayStatus = getStatusLabel(itemCategory, uiStatus);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-950/60 border border-gray-800/70"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white text-sm">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 mt-2 flex flex-wrap items-center gap-2">
                          {category === "all" && (
                            <span className="border border-gray-800 bg-gray-900 text-cyan-300 px-1.5 py-0.5 rounded text-[9px]">
                              {item.mediaType}
                            </span>
                          )}
                          <span>
                            Last updated:{" "}
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      <div className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded bg-gray-900 border border-gray-700/60 text-gray-300 whitespace-nowrap">
                        {displayStatus}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
