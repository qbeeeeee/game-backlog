import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// SkeletonLoader
// Displayed while TanStack Query is fetching the games list.
// Mimics the final grid layout so the layout does not jump on load.
// ---------------------------------------------------------------------------

// Single skeleton card — animates with Tailwind's built-in pulse animation
function SkeletonCard() {
  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4 bg-gray-800" />
        <Skeleton className="h-3 w-1/2 bg-gray-800/70" />
        <div className="flex gap-2 mt-auto pt-2">
          <Skeleton className="h-5 w-14 bg-gray-800" />
          <Skeleton className="h-5 w-20 bg-gray-800" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Full skeleton grid + arcade-style heading
// ---------------------------------------------------------------------------
export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6">
      {/* Arcade loading message */}
      <div className="flex items-center gap-3">
        <span className="animate-spin text-2xl select-none" aria-hidden="true">
          🎮
        </span>
        <p className="font-mono text-cyan-400 text-sm tracking-widest uppercase animate-pulse">
          Loading Player 1… Please Wait
        </p>
      </div>

      {/* Summary metric skeleton blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-gray-800 bg-gray-900">
            <CardContent>
              <Skeleton className="h-3 w-20 bg-gray-800 mb-2" />
              <Skeleton className="h-8 w-10 bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter buttons skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 bg-gray-800" />
        ))}
      </div>

      {/* Game card grid skeleton — 8 cards to match the API data count */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
