"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { DashboardGameStatus } from "@/lib/category-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusFilter = DashboardGameStatus | "All";

const FILTER_OPTIONS: StatusFilter[] = [
  "All",
  "Backlog",
  "Playing",
  "Completed",
];

interface StatusFilterBarProps {
  currentFilter: StatusFilter;
  currentQuery: string;
}

export function StatusFilterBar({
  currentFilter,
  currentQuery,
}: StatusFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function pushFilters(nextFilter: StatusFilter, nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter === "All") {
      params.delete("status");
    } else {
      params.set("status", nextFilter);
    }

    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <section aria-label="Filter games by status and search">
      <Card className="border-gray-800/70 bg-gray-950/70">
        <CardContent className="flex flex-col gap-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Status filter"
          >
            {FILTER_OPTIONS.map((filter) => {
              const isActive = currentFilter === filter;

              return (
                <Button
                  key={filter}
                  onClick={() => pushFilters(filter, searchInput)}
                  aria-pressed={isActive}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`text-xs font-mono font-semibold uppercase cursor-pointer tracking-widest ${
                    isActive
                      ? "bg-purple-600/80 text-white hover:bg-purple-500"
                      : "border-gray-700 bg-transparent text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {filter}
                </Button>
              );
            })}
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              pushFilters(currentFilter, searchInput);
            }}
          >
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, genre, or type"
              className="min-w-0 flex-1 border-gray-800 bg-black text-white placeholder:text-gray-600"
            />
            <Button
              type="submit"
              variant="outline"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "border-purple-500/60 text-xs font-semibold uppercase tracking-[0.2em] cursor-pointer bg-purple-500 text-white hover:text-white hover:bg-purple-600",
              )}
            >
              Search
            </Button>
          </form>

          <Badge
            variant="outline"
            className="w-fit text-[11px] uppercase tracking-widest text-gray-500 border-gray-700"
          >
            {isPending
              ? "Syncing URL state..."
              : "Filters are stored in the URL for shareable views."}
          </Badge>
        </CardContent>
      </Card>
    </section>
  );
}
