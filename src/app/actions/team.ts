"use server";

import { revalidatePath } from "next/cache";
import {
  addTeamMember,
  changeTeamMemberPassword,
  updateTeamMember,
  type AddTeamMemberInput,
  type TeamMemberRecord,
  type UpdateTeamMemberInput,
} from "@/lib/userStore";

export async function addTeamMemberAction(
  input: AddTeamMemberInput
): Promise<TeamMemberRecord> {
  const member = await addTeamMember(input);
  revalidatePath("/admin");
  return member;
}

export async function updateTeamMemberAction(
  input: UpdateTeamMemberInput
): Promise<TeamMemberRecord | null> {
  const member = await updateTeamMember(input);
  revalidatePath("/admin");
  return member;
}

export async function changeTeamMemberPasswordAction(
  id: string,
  newPassword: string
): Promise<boolean> {
  const result = await changeTeamMemberPassword(id, newPassword);
  revalidatePath("/admin");
  return result;
}
