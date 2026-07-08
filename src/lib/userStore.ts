import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import type { UserRole } from "@/lib/users";

interface UserDoc {
  _id: string;
  name: string;
  username: string;
  usernameLower: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
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

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<UserDoc>("team_members");
}

function toPublicRecord(doc: UserDoc): TeamMemberRecord {
  return {
    id: doc._id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
  };
}

async function usernameTaken(username: string, excludeId?: string): Promise<boolean> {
  const collection = await getUsersCollection();
  const existing = await collection.findOne({
    usernameLower: username.toLowerCase(),
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  return Boolean(existing);
}

export async function listTeamMembers(): Promise<TeamMemberRecord[]> {
  const collection = await getUsersCollection();
  const docs = await collection.find().sort({ createdAt: 1 }).toArray();
  return docs.map(toPublicRecord);
}

export async function getTeamMemberById(id: string): Promise<TeamMemberRecord | null> {
  const collection = await getUsersCollection();
  const found = await collection.findOne({ _id: id });
  return found ? toPublicRecord(found) : null;
}

export async function addTeamMember(
  input: AddTeamMemberInput
): Promise<TeamMemberRecord> {
  if (await usernameTaken(input.username)) {
    throw new Error("A team member with that username already exists.");
  }
  const collection = await getUsersCollection();
  const doc: UserDoc = {
    _id: crypto.randomUUID(),
    name: input.name,
    username: input.username,
    usernameLower: input.username.toLowerCase(),
    email: input.email,
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, 10),
    createdAt: new Date(),
  };
  await collection.insertOne(doc);
  return toPublicRecord(doc);
}

export async function updateTeamMember(
  input: UpdateTeamMemberInput
): Promise<TeamMemberRecord | null> {
  if (await usernameTaken(input.username, input.id)) {
    throw new Error("A team member with that username already exists.");
  }
  const collection = await getUsersCollection();
  const existing = await collection.findOne({ _id: input.id });
  if (!existing) return null;

  const updated: UserDoc = {
    ...existing,
    name: input.name,
    username: input.username,
    usernameLower: input.username.toLowerCase(),
    email: input.email,
    role: input.role,
  };
  await collection.replaceOne({ _id: input.id }, updated);
  return toPublicRecord(updated);
}

export async function changeTeamMemberPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const collection = await getUsersCollection();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const result = await collection.updateOne(
    { _id: id },
    { $set: { passwordHash } }
  );
  return result.matchedCount > 0;
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<TeamMemberRecord | null> {
  const collection = await getUsersCollection();
  const found = await collection.findOne({ usernameLower: username.toLowerCase() });
  if (!found) return null;
  const matches = await bcrypt.compare(password, found.passwordHash);
  if (!matches) return null;
  return toPublicRecord(found);
}
