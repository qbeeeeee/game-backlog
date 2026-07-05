import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Retro Game Backlog — Dashboard",
  description: "Your personal retro arcade game backlog tracker.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  const queryString = params.toString();
  redirect(
    queryString ? `/dashboard/games?${queryString}` : "/dashboard/games",
  );
}
