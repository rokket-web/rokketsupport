import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import type { ClientPlatform, ClientRecord } from "@/lib/clients";

// AES-256-GCM key used to encrypt client site passwords at rest. Derived from
// a static passphrase since there's no secrets manager yet — replace with a
// real env-provided secret once one exists. This lives only on the server.
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("rws-client-manager-server-key-v1")
  .digest();

interface ClientDoc {
  _id: string;
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  encryptedPassword: string;
  sftpUsername?: string;
  encryptedSftpPassword?: string;
  portalUsername?: string;
  portalPasswordHash?: string;
  createdAt: Date;
}

export interface AddClientInput {
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  password: string;
  sftpUsername?: string;
  sftpPassword?: string;
  portalUsername?: string;
}

export interface UpdateClientInput {
  id: string;
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  // Omit or leave blank to keep the existing password.
  password?: string;
  sftpUsername?: string;
  // Omit or leave blank to keep the existing SFTP password.
  sftpPassword?: string;
  portalUsername?: string;
}

async function getClientsCollection() {
  const db = await getDb();
  return db.collection<ClientDoc>("clients");
}

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

function decrypt(encoded: string): string {
  const combined = Buffer.from(encoded, "base64");
  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12, 28);
  const ciphertext = combined.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

function toPublicRecord(doc: ClientDoc): ClientRecord {
  return {
    id: doc._id,
    name: doc.name,
    websiteUrl: doc.websiteUrl,
    loginUrl: doc.loginUrl,
    platform: doc.platform,
    customPlatform: doc.customPlatform,
    adminUsername: doc.adminUsername,
    sftpUsername: doc.sftpUsername,
    hasSftpPassword: Boolean(doc.encryptedSftpPassword),
    portalUsername: doc.portalUsername,
    hasPortalPassword: Boolean(doc.portalPasswordHash),
  };
}

export async function listClients(): Promise<ClientRecord[]> {
  const collection = await getClientsCollection();
  const docs = await collection.find().sort({ createdAt: 1 }).toArray();
  return docs.map(toPublicRecord);
}

export async function addClient(input: AddClientInput): Promise<ClientRecord> {
  const collection = await getClientsCollection();
  const doc: ClientDoc = {
    _id: crypto.randomUUID(),
    name: input.name,
    websiteUrl: input.websiteUrl,
    loginUrl: input.loginUrl,
    platform: input.platform,
    customPlatform: input.platform === "Other" ? input.customPlatform : undefined,
    adminUsername: input.adminUsername,
    encryptedPassword: encrypt(input.password),
    sftpUsername: input.sftpUsername || undefined,
    encryptedSftpPassword: input.sftpPassword ? encrypt(input.sftpPassword) : undefined,
    portalUsername: input.portalUsername || undefined,
    createdAt: new Date(),
  };
  await collection.insertOne(doc);
  return toPublicRecord(doc);
}

export async function updateClient(
  input: UpdateClientInput
): Promise<ClientRecord | null> {
  const collection = await getClientsCollection();
  const existing = await collection.findOne({ _id: input.id });
  if (!existing) return null;

  const updated: ClientDoc = {
    ...existing,
    name: input.name,
    websiteUrl: input.websiteUrl,
    loginUrl: input.loginUrl,
    platform: input.platform,
    customPlatform: input.platform === "Other" ? input.customPlatform : undefined,
    adminUsername: input.adminUsername,
    encryptedPassword: input.password ? encrypt(input.password) : existing.encryptedPassword,
    sftpUsername: input.sftpUsername || undefined,
    encryptedSftpPassword: input.sftpPassword
      ? encrypt(input.sftpPassword)
      : existing.encryptedSftpPassword,
    portalUsername: input.portalUsername || undefined,
  };

  await collection.replaceOne({ _id: input.id }, updated);
  return toPublicRecord(updated);
}

export async function getClientCredentials(
  id: string
): Promise<{ username: string; password: string } | null> {
  const collection = await getClientsCollection();
  const found = await collection.findOne({ _id: id });
  if (!found) return null;
  return { username: found.adminUsername, password: decrypt(found.encryptedPassword) };
}

export async function getClientSftpCredentials(
  id: string
): Promise<{ username: string; password: string } | null> {
  const collection = await getClientsCollection();
  const found = await collection.findOne({ _id: id });
  if (!found || !found.encryptedSftpPassword) return null;
  return {
    username: found.sftpUsername ?? "",
    password: decrypt(found.encryptedSftpPassword),
  };
}

// Clients log into their own portal with a dedicated username/password,
// separate from the website admin login above — bcrypt-hashed like team
// members since we only ever need to verify it, never retrieve it.
export async function verifyClientPortalCredentials(
  username: string,
  password: string
): Promise<{ id: string; name: string } | null> {
  const collection = await getClientsCollection();
  const found = await collection.findOne({
    portalUsername: {
      $regex: `^${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  });
  if (!found || !found.portalPasswordHash) return null;
  const matches = await bcrypt.compare(password, found.portalPasswordHash);
  if (!matches) return null;
  return { id: found._id, name: found.name };
}

export async function setClientPortalPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const collection = await getClientsCollection();
  const portalPasswordHash = await bcrypt.hash(newPassword, 10);
  const result = await collection.updateOne(
    { _id: id },
    { $set: { portalPasswordHash } }
  );
  return result.matchedCount > 0;
}

export async function getClientById(id: string): Promise<ClientRecord | null> {
  const collection = await getClientsCollection();
  const found = await collection.findOne({ _id: id });
  return found ? toPublicRecord(found) : null;
}
