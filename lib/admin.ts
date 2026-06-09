const SUPER_ADMIN_EMAILS_ENV = "NEXT_PUBLIC_SUPER_ADMIN_EMAILS";

export function getSuperAdminEmails(): string[] {
  const raw = process.env[SUPER_ADMIN_EMAILS_ENV] ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}
