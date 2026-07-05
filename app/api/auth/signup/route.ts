import { ZodError } from "zod";

import { createSession } from "@/lib/server/auth/session";
import { hashPassword } from "@/lib/server/auth/password";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess, zodDetails } from "@/lib/server/http";
import { signupSchema } from "@/lib/server/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = signupSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return jsonError("Email is already in use.", 409);
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await db.user.create({
      data: {
        email: payload.email,
        passwordHash,
        displayName: payload.displayName,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    await createSession(user.id);

    return jsonSuccess({ user }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }
    console.log(error);

    return jsonError("Failed to sign up user.", 500);
  }
}
