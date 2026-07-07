import { cookies } from "next/headers";
import { verifyCredentials } from "@/lib/userStore";
import type { UserRole } from "@/lib/users";

const SESSION_COOKIE = "rws_session";

export interface Session {
  username: string;
  name: string;
  role: UserRole;
}

export async function verifyTeamMemberCredentials(
  username: string,
  password: string
): Promise<AppAuthResult> {
  const user = await verifyCredentials(username, password);
  if (!user) {
    return { success: false, error: "Invalid username or password." };
  }

  return {
    success: true,
    session: { username: user.username, name: user.name, role: user.role },
  };
}

export type AppAuthResult =
  | { success: true; session: Session }
  | { success: false; error: string };

export async function createSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
