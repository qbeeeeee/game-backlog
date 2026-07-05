import { ZodError } from "zod";

import { verifyPassword } from "@/lib/server/auth/password";
import { createSession } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { jsonError, jsonSuccess, zodDetails } from "@/lib/server/http";
import { loginSchema } from "@/lib/server/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const passwordOk = await verifyPassword(
      payload.password,
      user.passwordHash,
    );

    if (!passwordOk) {
      return jsonError("Invalid email or password.", 401);
    }

    await createSession(user.id);

    return jsonSuccess({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Validation failed.", 422, zodDetails(error));
    }

    return jsonError("Failed to log in user.", 500);
  }
}
