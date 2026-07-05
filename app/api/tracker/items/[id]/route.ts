import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess, zodDetails } from "@/lib/server/http";
import { updateTrackedItemSchema } from "@/lib/server/validators/tracker";

function toOptionalDate(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = updateTrackedItemSchema.parse(body);

    const existing = await db.trackedItem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existing || existing.userId !== userId) {
      return jsonError("Tracked item not found.", 404);
    }

    const item = await db.trackedItem.update({
      where: {
        id,
      },
      data: {
        mediaType: payload.mediaType,
        status: payload.status,
        title: payload.title,
        externalId: payload.externalId,
        source: payload.source,
        notes: payload.notes,
        rating: payload.rating,
        progressCurrent: payload.progressCurrent,
        progressTotal: payload.progressTotal,
        startedAt: toOptionalDate(payload.startedAt),
        completedAt: toOptionalDate(payload.completedAt),
        metadata: payload.metadata as never,
      },
    });

    return jsonSuccess({ item });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }

    return jsonError("Failed to update tracked item.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const { id } = await context.params;

  const existing = await db.trackedItem.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!existing || existing.userId !== userId) {
    return jsonError("Tracked item not found.", 404);
  }

  await db.trackedItem.delete({
    where: {
      id,
    },
  });

  return jsonSuccess({ deleted: true });
}
