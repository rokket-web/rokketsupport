"use server";

import { redirect } from "next/navigation";
import { verifyTeamMemberCredentials, createSession } from "@/lib/auth";

export interface TeamLoginState {
  error?: string;
}

export async function teamLoginAction(
  _prevState: TeamLoginState,
  formData: FormData
): Promise<TeamLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  const result = await verifyTeamMemberCredentials(username, password);
  if (!result.success) {
    return { error: result.error };
  }

  await createSession(result.session);

  if (result.session.role === "admin") {
    redirect("/admin");
  }
  redirect("/my-projects");
}
