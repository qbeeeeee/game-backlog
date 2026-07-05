import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GameDetailContent } from "@/components/dashboard/games/id/GameDetailContent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  DASHBOARD_CATEGORY_META,
  parseDashboardCategoryStrict,
} from "@/lib/dashboard-categories";
import { notFound } from "next/navigation";
import AddToLibrary from "@/components/dashboard/AddToLibrary";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { category: categoryParam, id } = await params;
  const category = parseDashboardCategoryStrict(categoryParam);

  return {
    title: `${category ? DASHBOARD_CATEGORY_META[category].label : "Item"} Detail ${id} - Retro Backlog`,
    description: "Live item detail powered by category-aware dynamic routing.",
  };
}

export default async function DashboardCategoryDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category: categoryParam, id } = await params;
  const category = parseDashboardCategoryStrict(categoryParam);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/dashboard/${category}`}
        className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-cyan-400/70 transition-colors hover:text-cyan-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to {DASHBOARD_CATEGORY_META[category].label}
      </Link>

      <div className="flex items-center justify-between">
        <div className="mb-8 mt-4">
          <Badge
            variant="outline"
            className="border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
          >
            Dynamic route
          </Badge>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-widest text-white">
            {DASHBOARD_CATEGORY_META[category].label} detail
          </h1>
        </div>

        <AddToLibrary />
      </div>

      <GameDetailContent gameId={id} category={category} />
    </div>
  );
}
