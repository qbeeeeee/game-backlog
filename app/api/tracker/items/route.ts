import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess, zodDetails } from "@/lib/server/http";
import {
  createTrackedItemSchema,
  trackerQuerySchema,
} from "@/lib/server/validators/tracker";

function toOptionalDate(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = trackerQuerySchema.parse(params);

    const where: Prisma.TrackedItemWhereInput = {
      userId,
      mediaType: query.mediaType,
      status: query.status,
      title: query.search
        ? {
            contains: query.search,
          }
        : undefined,
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      db.trackedItem.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.limit,
      }),
      db.trackedItem.count({ where }),
    ]);

    return jsonSuccess({
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(Math.ceil(total / query.limit), 1),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }

    return jsonError("Failed to fetch tracked items.", 500);
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const body = await request.json();
    const payload = createTrackedItemSchema.parse(body);

    const item = await db.trackedItem.create({
      data: {
        userId,
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

    return jsonSuccess({ item }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }

    return jsonError("Failed to create tracked item.", 500);
  }
}
