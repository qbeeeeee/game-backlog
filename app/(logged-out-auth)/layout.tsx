import type { ReactNode } from "react";

import Gameboy from "@/components/loggedout/Gameboy";

export default function LoggedOutLayout({ children }: { children: ReactNode }) {
  return <Gameboy>{children}</Gameboy>;
}
