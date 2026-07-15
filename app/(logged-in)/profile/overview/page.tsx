import { ProfileCategoryWrapper } from "@/components/profile/ProfilleCategoryWrapper";
import { ProfileOverviewContent } from "@/components/profile/ProfileOverviewContent";
import { PROFILE_CATEGORY_META } from "@/lib/profile-categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${PROFILE_CATEGORY_META["overview"].label} Profile - Retro Backlog`,
  description: PROFILE_CATEGORY_META["overview"].description,
};

export default function ProfileOverviewPage() {
  return (
    <ProfileCategoryWrapper category="overview">
      <ProfileOverviewContent />
    </ProfileCategoryWrapper>
  );
}
