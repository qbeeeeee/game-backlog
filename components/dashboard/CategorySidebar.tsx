"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DASHBOARD_CATEGORIES,
  DASHBOARD_CATEGORY_META,
  parseDashboardCategory,
} from "@/lib/dashboard-categories";
import { cn } from "@/lib/utils";

export function CategorySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profile = {
    firstName: "Kyuubi",
    lastName: "Player",
    imageUrl: "",
  };

  const initials = `${profile.firstName?.charAt(0) ?? ""}${
    profile.lastName?.charAt(0) ?? ""
  }`
    .toUpperCase()
    .trim();

  const activeCategory =
    pathname !== "/dashboard" && pathname.startsWith("/dashboard/")
      ? "games"
      : parseDashboardCategory(searchParams.get("category"));

  return (
    <aside className="space-y-3 h-full" aria-label="Backlog categories">
      <nav
        aria-label="Category navigation"
        className="flex flex-col justify-between h-full"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-24">
            <span className="text-xl" aria-hidden="true">
              🕹️
            </span>
            <span className="text-sm font-bold tracking-widest text-purple-300 uppercase">
              Game Backlog
            </span>
            <Badge
              variant="outline"
              className="border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
            >
              Arcade
            </Badge>
          </div>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Categories
          </p>

          <div className="space-y-1">
            {DASHBOARD_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;

              return (
                <Link
                  key={category}
                  href={`/dashboard?category=${category}`}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-3 transition-colors",
                    "text-xs font-semibold uppercase tracking-[0.22em]",
                    isActive
                      ? "bg-cyan-900/30 text-cyan-200"
                      : "text-gray-400 hover:bg-gray-900/80 hover:text-gray-100",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{DASHBOARD_CATEGORY_META[category].label}</span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      isActive
                        ? "bg-cyan-300"
                        : "bg-gray-700 group-hover:bg-gray-500",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>

          <div className="pt-6">
            <Badge
              variant="outline"
              className="border-purple-500/40 text-[10px] uppercase tracking-[0.2em] text-purple-300"
            >
              Active: {DASHBOARD_CATEGORY_META[activeCategory].label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-4 list-none">
            {/* <li>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs tracking-widest uppercase hover:bg-cyan-300 text-cyan-300 hover:text-black",
                )}
              >
                Dashboard
              </Link>
            </li> */}
            <li>
              <Avatar className="size-9 border border-purple-300/30">
                <AvatarImage
                  src={profile.imageUrl || undefined}
                  alt={`${profile.firstName} ${profile.lastName}`}
                />
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
            </li>
            <li>
              <Link
                href="/"
                className="text-xs px-3 tracking-widest uppercase border-gray-700 text-gray-300 hover:text-white"
              >
                Exit
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
