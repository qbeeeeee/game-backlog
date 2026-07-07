import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardCategoryTracker } from "@/components/dashboard/DashboardNavigationSync";
import { CategoryPageLayout } from "@/components/layouts/CategoryPageLayout";
import {
  DASHBOARD_CATEGORY_META,
  parseDashboardCategoryStrict,
} from "@/lib/dashboard-categories";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = parseDashboardCategoryStrict(categoryParam);

  if (!category) {
    return {
      title: "Dashboard - Retro Backlog",
      description: "Your personal retro arcade game backlog tracker.",
    };
  }

  return {
    title: `${DASHBOARD_CATEGORY_META[category].label} Dashboard - Retro Backlog`,
    description: DASHBOARD_CATEGORY_META[category].description,
  };
}

export default async function DashboardCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryParam } = await params;
  const category = parseDashboardCategoryStrict(categoryParam);

  if (!category) {
    notFound();
  }

  const categoryMeta = DASHBOARD_CATEGORY_META[category];

  return (
    <CategoryPageLayout
      badgeLabel={categoryMeta.label}
      titleSuffix="Backlog Hub"
      description={categoryMeta.description}
    >
      <DashboardCategoryTracker category={category} />
      <DashboardContent category={category} />
    </CategoryPageLayout>
  );
}
