import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface LoggedInShellProps {
  children: ReactNode;
  desktopSidebar: ReactNode;
  mobileMenu: ReactNode;
}

export function LoggedInShell({
  children,
  desktopSidebar,
  mobileMenu,
}: LoggedInShellProps) {
  return (
    <div className="min-h-screen bg-gray-950 font-mono overflow-hidden">
      <header className="block lg:hidden sticky top-0 z-20 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto h-20 flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
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

          <nav aria-label="Section navigation">{mobileMenu}</nav>
        </div>
      </header>

      <main className="w-full">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="hidden border-r border-gray-800/70 bg-black/20 lg:block">
            <div className="fixed top-0 h-full w-[270px] overflow-y-auto px-4 py-6">
              {desktopSidebar}
            </div>
          </aside>

          <div className="mx-auto w-full max-w-6xl px-4 py-10">
            <section>{children}</section>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800/40 py-6 text-center">
        <p className="text-[10px] tracking-widest text-gray-700 uppercase">
          © 1985 Retro Arcade Systems &nbsp;|&nbsp; Insert Coin to Continue
        </p>
      </footer>
    </div>
  );
}
