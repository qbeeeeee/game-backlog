import {
  PROFILE_CATEGORY_META,
  type ProfileCategory,
} from "@/lib/profile/categories";

export function ProfileContent({ category }: { category: ProfileCategory }) {
  return (
    <div className="text-white">Profile content for {category} goes here</div>
  );
}
