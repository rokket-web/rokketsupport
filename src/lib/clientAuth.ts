import { cookies } from "next/headers";
import { verifyClientPortalCredentials } from "@/lib/clientStore";

const CLIENT_SESSION_COOKIE = "rws_client_session";

export interface ClientSession {
  clientId: string;
  name: string;
}

export type ClientAuthResult =
  | { success: true; session: ClientSession }
  | { success: false; error: string };

export async function verifyClientCredentials(
  username: string,
  password: string
): Promise<ClientAuthResult> {
  const client = await verifyClientPortalCredentials(username, password);
  if (!client) {
    return { success: false, error: "Invalid username or password." };
  }
  return { success: true, session: { clientId: client.id, name: client.name } };
}

export async function createClientSession(session: ClientSession) {
  const store = await cookies();
  store.set(CLIENT_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function getClientSession(): Promise<ClientSession | null> {
  const store = await cookies();
  const raw = store.get(CLIENT_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientSession;
  } catch {
    return null;
  }
}

export async function clearClientSession() {
  const store = await cookies();
  store.delete(CLIENT_SESSION_COOKIE);
}
