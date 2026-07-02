import type { ReactNode } from "react";
import { LoggedInShell } from "@/components/layouts/LoggedInShell";
import { ProfileMobileMenu } from "@/components/profile/ProfileMobileMenu";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

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
