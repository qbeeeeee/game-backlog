import { CategoryPanels } from "@/components/dashboard/CategoryPanels";
import { Badge } from "@/components/ui/badge";
import {
  DASHBOARD_CATEGORY_META,
  parseDashboardCategory,
} from "@/lib/dashboard-categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Game Backlog — Dashboard",
  description: "Your personal retro arcade game backlog tracker.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const category = parseDashboardCategory(categoryParam);
  const categoryMeta = DASHBOARD_CATEGORY_META[category];

  return (
    <>
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
        >
          {categoryMeta.label}
        </Badge>
        <h1 className="text-2xl font-bold tracking-widest text-white uppercase">
          My{" "}
          <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]">
            Retro
          </span>{" "}
          Backlog Hub
        </h1>
        <p className="mt-1 text-xs tracking-widest text-gray-600 uppercase">
          {categoryMeta.description}
        </p>
      </div>

      <CategoryPanels category={category} />
    </>
  );
}
