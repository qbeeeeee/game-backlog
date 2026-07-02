import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GameDetailContent } from "@/components/dashboard/id/GameDetailContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Game Detail ${id} - Retro Backlog`,
    description: "Live game detail powered by Twitch + IGDB data.",
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <Badge
          variant="outline"
          className="border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
        >
          Dynamic route
        </Badge>
        <h1 className="mt-2 text-2xl font-bold uppercase tracking-widest text-white">
          Game detail
        </h1>
      </div>

      <GameDetailContent gameId={id} />
    </div>
  );
}
