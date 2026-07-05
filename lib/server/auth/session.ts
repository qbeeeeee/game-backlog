import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { signSessionToken, verifySessionToken } from "@/lib/server/auth/jwt";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function createSession(userId: string) {
  const token = await signSessionToken(
    { sub: userId },
    SESSION_MAX_AGE_SECONDS,
  );
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload?.sub ?? null;
}
