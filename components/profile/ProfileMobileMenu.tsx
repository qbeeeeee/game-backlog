"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function ProfileMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
          "fixed inset-0 z-[90] bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-[100] h-screen w-[88vw] max-w-[340px] border-l border-gray-800 bg-gray-950 p-5 shadow-2xl transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Mobile profile menu"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Profile
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-gray-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:border-gray-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/30">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Profile menu empty for now
          </p>
        </div>

        <div className="mt-6 border-t border-gray-800 pt-4">
          <Link
            href="/"
            className="block rounded-md px-3 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Exit
          </Link>
        </div>
      </aside>
    </>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-gray-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-950/30"
      >
        Menu
      </button>

      {isMounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
