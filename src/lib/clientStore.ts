import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { ClientPlatform, ClientRecord } from "@/lib/clients";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "clients.json");

// AES-256-GCM key used to encrypt client site passwords at rest. Derived from
// a static passphrase since there's no secrets manager yet — replace with a
// real env-provided secret once one exists. This now lives only on the
// server, unlike the earlier client-side version of this feature.
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("rws-client-manager-server-key-v1")
  .digest();

interface StoredClient extends ClientRecord {
  encryptedPassword: string;
}

export interface AddClientInput {
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  password: string;
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

async function readAll(): Promise<StoredClient[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as StoredClient[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(clients: StoredClient[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(clients, null, 2), "utf8");
}

function toPublicRecord(stored: StoredClient): ClientRecord {
  const { id, name, websiteUrl, loginUrl, platform, customPlatform, adminUsername } = stored;
  return { id, name, websiteUrl, loginUrl, platform, customPlatform, adminUsername };
}

export async function listClients(): Promise<ClientRecord[]> {
  const clients = await readAll();
  return clients.map(toPublicRecord);
}

export async function addClient(input: AddClientInput): Promise<ClientRecord> {
  const clients = await readAll();
  const stored: StoredClient = {
    id: crypto.randomUUID(),
    name: input.name,
    websiteUrl: input.websiteUrl,
    loginUrl: input.loginUrl,
    platform: input.platform,
    customPlatform: input.platform === "Other" ? input.customPlatform : undefined,
    adminUsername: input.adminUsername,
    encryptedPassword: encrypt(input.password),
  };
  clients.push(stored);
  await writeAll(clients);
  return toPublicRecord(stored);
}

export async function updateClient(
  input: UpdateClientInput
): Promise<ClientRecord | null> {
  const clients = await readAll();
  const index = clients.findIndex((c) => c.id === input.id);
  if (index === -1) return null;

  const existing = clients[index];
  const updated: StoredClient = {
    ...existing,
    name: input.name,
    websiteUrl: input.websiteUrl,
    loginUrl: input.loginUrl,
    platform: input.platform,
    customPlatform: input.platform === "Other" ? input.customPlatform : undefined,
    adminUsername: input.adminUsername,
    encryptedPassword: input.password
      ? encrypt(input.password)
      : existing.encryptedPassword,
  };
  clients[index] = updated;
  await writeAll(clients);
  return toPublicRecord(updated);
}

export async function getClientCredentials(
  id: string
): Promise<{ username: string; password: string } | null> {
  const clients = await readAll();
  const found = clients.find((c) => c.id === id);
  if (!found) return null;
  return { username: found.adminUsername, password: decrypt(found.encryptedPassword) };
}
