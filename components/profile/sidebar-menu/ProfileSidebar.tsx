"use client";

import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  PROFILE_CATEGORIES,
  PROFILE_CATEGORY_META,
  parseProfileCategory,
  parseProfileCategoryStrict,
} from "@/lib/profile-categories";
import { usePathname, useSearchParams } from "next/navigation";

export function ProfileSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathnameCategory = parseProfileCategoryStrict(
    pathname.match(/^\/profile\/([^/]+)/)?.[1],
  );
  const activeCategory =
    pathnameCategory ?? parseProfileCategory(searchParams.get("category"));

  return (
    <aside className="h-full" aria-label="Profile navigation sidebar">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-24 flex items-center gap-2">
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
            Profile
          </p>

          <div className="space-y-1">
            {PROFILE_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;

              return (
                <Link
                  key={category}
                  href={`/profile/${category}`}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-3 transition-colors",
                    "text-xs font-semibold uppercase tracking-[0.22em]",
                    isActive
                      ? "bg-cyan-900/30 text-cyan-200"
                      : "text-gray-400 hover:bg-gray-900/80 hover:text-gray-100",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{PROFILE_CATEGORY_META[category].label}</span>
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
              Active: {PROFILE_CATEGORY_META[activeCategory].label}
            </Badge>
          </div>
        </div>

        <ul className="flex items-center gap-2 list-none">
          <LogoutButton />
        </ul>
      </div>
    </aside>
  );
}
