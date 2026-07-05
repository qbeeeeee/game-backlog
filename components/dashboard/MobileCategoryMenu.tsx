"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  DASHBOARD_CATEGORIES,
  DASHBOARD_CATEGORY_META,
  parseDashboardCategory,
  parseDashboardCategoryStrict,
} from "@/lib/dashboard-categories";
import { cn } from "@/lib/utils";

export function MobileCategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathnameCategory = parseDashboardCategoryStrict(
    pathname.match(/^\/dashboard\/([^/]+)/)?.[1],
  );
  const activeCategory =
    pathnameCategory ?? parseDashboardCategory(searchParams.get("category"));

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const drawer = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-90 bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-category-drawer"
        className={cn(
          "fixed right-0 top-0 z-100 h-screen w-[88vw] max-w-85 border-l border-gray-800 bg-gray-950 p-5 shadow-2xl transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Mobile category menu"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Categories
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-gray-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:border-gray-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <nav aria-label="Mobile dashboard categories" className="space-y-2">
          {DASHBOARD_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Link
                key={category}
                href={`/dashboard/${category}`}
                className={cn(
                  "block rounded-md px-3 py-3 text-xs font-semibold uppercase tracking-[0.22em]",
                  isActive
                    ? "bg-cyan-900/30 text-cyan-200"
                    : "text-gray-300 hover:bg-gray-900 hover:text-white",
                )}
              >
                {DASHBOARD_CATEGORY_META[category].label}
              </Link>
            );
          })}
        </nav>

        <ul className="flex items-center gap-2 list-none mt-6 border-t border-gray-800 pt-4">
          <LogoutButton />
        </ul>
      </aside>
    </>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-950/30"
        aria-expanded={isOpen}
        aria-controls="mobile-category-drawer"
      >
        Menu
      </button>

      {isMounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
