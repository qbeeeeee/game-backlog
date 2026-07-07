import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface CategoryPageLayoutProps {
  badgeLabel: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix: string;
  description: string;
  children: ReactNode;
}

export function CategoryPageLayout({
  badgeLabel,
  titlePrefix = "My",
  titleHighlight = "Retro",
  titleSuffix,
  description,
  children,
}: CategoryPageLayoutProps) {
  return (
    <>
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
        >
          {badgeLabel}
        </Badge>
        <h1 className="text-2xl font-bold tracking-widest text-white uppercase">
          {titlePrefix}{" "}
          <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]">
            {titleHighlight}
          </span>{" "}
          {titleSuffix}
        </h1>
        <p className="mt-1 text-xs tracking-widest text-gray-600 uppercase">
          {description}
        </p>
      </div>

      {children}
    </>
  );
}
