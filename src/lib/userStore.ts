import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/lib/users";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

interface StoredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

// Public shape sent to the browser — never includes the password hash.
export interface TeamMemberRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AddTeamMemberInput {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateTeamMemberInput {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
}

// Seeds the first site admin on first run (plaintext: ddxs489Z!) so the
// original login keeps working now that users live in the persistent store
// instead of a hardcoded array.
const SEED_USERS: StoredUser[] = [
  {
    id: "seed-admin",
    name: "Site Admin",
    username: "Admin",
    email: "",
    role: "admin",
    passwordHash: "$2b$10$pk6z1orPLrAVH07C9H2x1OqyOx7u.j0smRNfB5dtcf4nKg3qnBJEi",
  },
];

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as StoredUser[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return SEED_USERS;
    }
    throw err;
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

function toPublicRecord(stored: StoredUser): TeamMemberRecord {
  const { id, name, username, email, role } = stored;
  return { id, name, username, email, role };
}

function usernameTaken(users: StoredUser[], username: string, excludeId?: string): boolean {
  return users.some(
    (u) => u.id !== excludeId && u.username.toLowerCase() === username.toLowerCase()
  );
}

export async function listTeamMembers(): Promise<TeamMemberRecord[]> {
  const users = await readAll();
  return users.map(toPublicRecord);
}

export async function addTeamMember(
  input: AddTeamMemberInput
): Promise<TeamMemberRecord> {
  const users = await readAll();
  if (usernameTaken(users, input.username)) {
    throw new Error("A team member with that username already exists.");
  }
  const stored: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name,
    username: input.username,
    email: input.email,
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, 10),
  };
  users.push(stored);
  await writeAll(users);
  return toPublicRecord(stored);
}

export async function updateTeamMember(
  input: UpdateTeamMemberInput
): Promise<TeamMemberRecord | null> {
  const users = await readAll();
  const index = users.findIndex((u) => u.id === input.id);
  if (index === -1) return null;
  if (usernameTaken(users, input.username, input.id)) {
    throw new Error("A team member with that username already exists.");
  }

  const updated: StoredUser = {
    ...users[index],
    name: input.name,
    username: input.username,
    email: input.email,
    role: input.role,
  };
  users[index] = updated;
  await writeAll(users);
  return toPublicRecord(updated);
}

export async function changeTeamMemberPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const users = await readAll();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users[index] = {
    ...users[index],
    passwordHash: await bcrypt.hash(newPassword, 10),
  };
  await writeAll(users);
  return true;
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<TeamMemberRecord | null> {
  const users = await readAll();
  const found = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!found) return null;
  const matches = await bcrypt.compare(password, found.passwordHash);
  if (!matches) return null;
  return toPublicRecord(found);
}
