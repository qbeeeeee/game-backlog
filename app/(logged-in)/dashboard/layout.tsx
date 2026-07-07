import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar-menu/DashboardSidebar";
import { DashboardMobileMenu } from "@/components/dashboard/sidebar-menu/DashboardMobileMenu";
import { LoggedInShell } from "@/components/layouts/LoggedInShell";

export default function DashboardSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoggedInShell
      desktopSidebar={<DashboardSidebar />}
      mobileMenu={<DashboardMobileMenu />}
    >
      {children}
    </LoggedInShell>
  );
}
