import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

// The cookie value is the server secret. It is httpOnly and can only be
// obtained by authenticating with the admin password, so comparing against
// AUTH_SECRET is enough to gate the admin panel for this starter app.
export function expectedToken(): string {
  return process.env.AUTH_SECRET || "dev-secret-token";
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === expectedToken();
}
