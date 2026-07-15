import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let sessionRecoveryStarted = false;

function isInvalidRefreshTokenError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "refresh_token_not_found" ||
    message.includes("Refresh Token Not Found") ||
    message.includes("Invalid Refresh Token")
  );
}

/** Clear a corrupted local session once (common after a crash / revoked token). */
function recoverInvalidSession(client: ReturnType<typeof createBrowserClient>) {
  if (typeof window === "undefined" || sessionRecoveryStarted) return;
  sessionRecoveryStarted = true;

  void (async () => {
    try {
      const { error } = await client.auth.getUser();
      if (!isInvalidRefreshTokenError(error)) return;
      await client.auth.signOut({ scope: "local" });
    } catch {
      await client.auth.signOut({ scope: "local" });
    }
  })();
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.");
  }

  const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  recoverInvalidSession(client);
  return client;
}
