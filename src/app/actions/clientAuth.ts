"use server";

import { redirect } from "next/navigation";
import {
  verifyClientCredentials,
  createClientSession,
  clearClientSession,
} from "@/lib/clientAuth";

export interface ClientLoginState {
  error?: string;
}

export async function clientLoginAction(
  _prevState: ClientLoginState,
  formData: FormData
): Promise<ClientLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  const result = await verifyClientCredentials(username, password);
  if (!result.success) {
    return { error: result.error };
  }

  await createClientSession(result.session);
  redirect("/client-dashboard");
}

export async function clientLogoutAction() {
  await clearClientSession();
  redirect("/");
}
