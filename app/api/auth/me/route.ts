import type { NextRequest } from "next/server";

import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          bio: true,
          location: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    return jsonError("User not found.", 404);
  }

  return jsonSuccess({ user });
}
