import type { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const searchParams = request.nextUrl.searchParams;
  const mediaType = searchParams.get("mediaType");

  const whereClause: any = { userId };
  if (mediaType && mediaType !== "ALL") {
    whereClause.mediaType = mediaType;
  }

  const [byStatus, byMediaType, total, items] = await Promise.all([
    db.trackedItem.groupBy({
      by: ["status"],
      where: whereClause,
      _count: { _all: true },
    }),
    db.trackedItem.groupBy({
      by: ["mediaType"],
      where: whereClause,
      _count: { _all: true },
    }),
    db.trackedItem.count({ where: whereClause }),
    db.trackedItem.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        status: true,
        mediaType: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const completedCount = byStatus.find((entry) => entry.status === "COMPLETED")
    ?._count._all;

  return jsonSuccess({
    total,
    completed: completedCount ?? 0,
    completionRate:
      total > 0
        ? Number((((completedCount ?? 0) / total) * 100).toFixed(2))
        : 0,
    byStatus: byStatus.map((entry) => ({
      status: entry.status,
      count: entry._count._all,
    })),
    byMediaType: byMediaType.map((entry) => ({
      mediaType: entry.mediaType,
      count: entry._count._all,
    })),
    items,
  });
}
