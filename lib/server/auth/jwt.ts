import { jwtVerify, SignJWT } from "jose";

const JWT_ALGORITHM = "HS256";
const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  sub: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
  expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS,
) {
  const jwtPayload: Record<string, unknown> = { sub: payload.sub };

  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }

    return {
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}
