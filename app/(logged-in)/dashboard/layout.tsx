import type { ReactNode } from "react";
import { CategorySidebar } from "@/components/dashboard/CategorySidebar";
import { MobileCategoryMenu } from "@/components/dashboard/MobileCategoryMenu";
import { LoggedInShell } from "@/components/layouts/LoggedInShell";

export default function DashboardSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoggedInShell
      desktopSidebar={<CategorySidebar />}
      mobileMenu={<MobileCategoryMenu />}
    >
      {children}
    </LoggedInShell>
  );
}
