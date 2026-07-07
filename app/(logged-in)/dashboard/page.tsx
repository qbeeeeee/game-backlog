import type { Metadata } from "next";
import { DashboardLandingRedirect } from "@/components/dashboard/DashboardNavigationSync";

export const metadata: Metadata = {
  title: "Retro Game Backlog — Dashboard",
  description: "Your personal retro arcade game backlog tracker.",
};

export default function DashboardPage() {
  return <DashboardLandingRedirect />;
}
