import { clearSession } from "@/lib/server/auth/session";
import { jsonSuccess } from "@/lib/server/http";

export async function POST() {
  await clearSession();
  return jsonSuccess({ loggedOut: true });
}
