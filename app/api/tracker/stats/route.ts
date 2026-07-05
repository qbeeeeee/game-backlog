import type { NextRequest } from "next/server";

import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const [byStatus, byMediaType, total] = await Promise.all([
    db.trackedItem.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    db.trackedItem.groupBy({
      by: ["mediaType"],
      where: { userId },
      _count: { _all: true },
    }),
    db.trackedItem.count({ where: { userId } }),
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
  });
}
