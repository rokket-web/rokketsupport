"use server";

import { revalidatePath } from "next/cache";
import {
  addClient,
  getClientCredentials,
  getClientSftpCredentials,
  updateClient,
  type AddClientInput,
  type UpdateClientInput,
} from "@/lib/clientStore";
import type { ClientRecord } from "@/lib/clients";

export async function addClientAction(input: AddClientInput): Promise<ClientRecord> {
  const client = await addClient(input);
  revalidatePath("/admin");
  return client;
}

export async function updateClientAction(
  input: UpdateClientInput
): Promise<ClientRecord | null> {
  const client = await updateClient(input);
  revalidatePath("/admin");
  return client;
}

export async function getClientCredentialsAction(
  id: string
): Promise<{ username: string; password: string } | null> {
  return getClientCredentials(id);
}

export async function getClientSftpCredentialsAction(
  id: string
): Promise<{ username: string; password: string } | null> {
  return getClientSftpCredentials(id);
}
