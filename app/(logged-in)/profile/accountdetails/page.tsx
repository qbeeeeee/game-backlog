import { ProfileCategoryWrapper } from "@/components/profile/ProfilleCategoryWrapper";
import { PROFILE_CATEGORY_META } from "@/lib/profile/categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${PROFILE_CATEGORY_META["accountdetails"].label} Profile - Retro Backlog`,
  description: PROFILE_CATEGORY_META["accountdetails"].description,
};

export default function AccountDetailsPage() {
  return (
    <ProfileCategoryWrapper category="accountdetails">
      <div className="text-white">Account Details Page Content</div>
    </ProfileCategoryWrapper>
  );
}
