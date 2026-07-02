import type { ReactNode } from "react";
import { QueryProvider } from "@/components/dashboard/QueryProvider";

export default function LoggedInLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
