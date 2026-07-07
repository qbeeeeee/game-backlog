import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getUserIdFromSession } from "@/lib/server/auth/session";

export default async function LoggedInLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await getUserIdFromSession();

  if (!userId) {
    redirect("/login");
  }

  return children;
}
