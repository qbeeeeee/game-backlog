import { ZodError } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json(
    {
      ok: false,
      error: {
        message,
        details: details ?? null,
      },
    },
    { status },
  );
}

export function jsonSuccess<T>(data: T, status = 200) {
  return Response.json(
    {
      ok: true,
      data,
    },
    { status },
  );
}

export function zodDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
