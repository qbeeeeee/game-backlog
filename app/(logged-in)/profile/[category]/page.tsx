import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileCategoryTracker } from "@/components/profile/ProfileNavigationSync";
import { CategoryPageLayout } from "@/components/layouts/CategoryPageLayout";
import {
  PROFILE_CATEGORY_META,
  parseProfileCategoryStrict,
} from "@/lib/profile/categories";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = parseProfileCategoryStrict(categoryParam);

  if (!category) {
    return {
      title: "Profile - Retro Backlog",
      description: "Your personal retro arcade game profile.",
    };
  }

  return {
    title: `${PROFILE_CATEGORY_META[category].label} Profile - Retro Backlog`,
    description: PROFILE_CATEGORY_META[category].description,
  };
}

export default async function ProfileCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryParam } = await params;
  const category = parseProfileCategoryStrict(categoryParam);

  if (!category) {
    notFound();
  }

  const categoryMeta = PROFILE_CATEGORY_META[category];

  return (
    <CategoryPageLayout
      badgeLabel={categoryMeta.label}
      titleSuffix="Backlog Hub"
      description={categoryMeta.description}
    >
      <ProfileCategoryTracker category={category} />
      <ProfileContent category={category} />
    </CategoryPageLayout>
  );
}
