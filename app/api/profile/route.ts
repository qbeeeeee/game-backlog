import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { getUserIdFromRequest } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess, zodDetails } from "@/lib/server/http";
import { profileUpdateSchema } from "@/lib/server/validators/auth";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const profile = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
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

  if (!profile) {
    return jsonError("User not found.", 404);
  }

  return jsonSuccess({ profile });
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const body = await request.json();
    const payload = profileUpdateSchema.parse(body);

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        displayName: payload.displayName,
        avatarUrl: payload.avatarUrl,
      },
    });

    const profile = await db.profile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        bio: payload.bio,
        location: payload.location,
      },
      update: {
        bio: payload.bio,
        location: payload.location,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const updatedProfile = {
      user,
      profile,
    };

    return jsonSuccess(updatedProfile);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }

    return jsonError("Failed to update profile.", 500);
  }
}
