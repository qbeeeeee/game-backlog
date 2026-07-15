import type { ReactNode } from "react";

import { ProfileCategoryTracker } from "@/components/profile/ProfileNavigationSync";
import { CategoryPageLayout } from "@/components/layouts/CategoryPageLayout";
import { PROFILE_CATEGORY_META } from "@/lib/profile/categories";

export function ProfileCategoryWrapper({
  category,
  children,
}: {
  category: keyof typeof PROFILE_CATEGORY_META;
  children: ReactNode;
}) {
  const categoryMeta = PROFILE_CATEGORY_META[category];

  return (
    <CategoryPageLayout
      badgeLabel={categoryMeta.label}
      titleSuffix="Backlog Hub"
      description={categoryMeta.description}
    >
      <ProfileCategoryTracker category={category} />
      {children}
    </CategoryPageLayout>
  );
}
