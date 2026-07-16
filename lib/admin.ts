/** MVP admin allowlist — replace with role-based auth when migrating to Clerk. */
export const ADMIN_EMAILS = [
  "ipinnu.oladipo23@gmail.com",
  "fixoraglobalhub@gmail.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}
