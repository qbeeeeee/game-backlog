import type { Metadata } from "next";
import { ProfileLandingRedirect } from "@/components/profile/ProfileNavigationSync";

export const metadata: Metadata = {
  title: "Retro Game Backlog — Profile",
  description: "Your personal retro arcade game profile.",
};

export default function ProfilePage() {
  return <ProfileLandingRedirect />;
}
