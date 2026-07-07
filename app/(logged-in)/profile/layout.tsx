import type { ReactNode } from "react";
import { LoggedInShell } from "@/components/layouts/LoggedInShell";
import { ProfileMobileMenu } from "@/components/profile/sidebar-menu/ProfileMobileMenu";
import { ProfileSidebar } from "@/components/profile/sidebar-menu/ProfileSidebar";

export default function ProfileSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoggedInShell
      desktopSidebar={<ProfileSidebar />}
      mobileMenu={<ProfileMobileMenu />}
    >
      {children}
    </LoggedInShell>
  );
}
