import "server-only";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import type {
  SupportRequestSummary,
  SupportRequestDetails,
  SupportRequestGroup,
} from "@/lib/supportRequests";

interface SupportRequestImageDoc {
  contentType: string;
  data: Buffer;
}

interface SupportRequestDoc {
  _id: string;
  clientId: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
  description: string;
  images: SupportRequestImageDoc[];
  status: "open" | "closed";
  createdAt: Date;
}

export interface AddSupportRequestInput {
  clientId: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
  description: string;
  images: SupportRequestImageDoc[];
}

async function getCollection() {
  const db = await getDb();
  return db.collection<SupportRequestDoc>("support_requests");
}

function toSummary(doc: SupportRequestDoc): SupportRequestSummary {
  return {
    id: doc._id,
    clientId: doc.clientId,
    clientName: doc.clientName,
    websiteUrl: doc.websiteUrl,
    issue: doc.issue,
    createdAt: doc.createdAt.toISOString(),
  };
}

function toDetails(doc: SupportRequestDoc): SupportRequestDetails {
  return {
    ...toSummary(doc),
    description: doc.description,
    images: doc.images.map((img) => ({
      contentType: img.contentType,
      dataUrl: `data:${img.contentType};base64,${img.data.toString("base64")}`,
    })),
  };
}

export async function addSupportRequest(
  input: AddSupportRequestInput
): Promise<SupportRequestSummary> {
  const collection = await getCollection();
  const doc: SupportRequestDoc = {
    _id: crypto.randomUUID(),
    clientId: input.clientId,
    clientName: input.clientName,
    websiteUrl: input.websiteUrl,
    issue: input.issue,
    description: input.description,
    images: input.images,
    status: "open",
    createdAt: new Date(),
  };
  await collection.insertOne(doc);
  return toSummary(doc);
}

export async function listSupportRequestsForClient(
  clientId: string
): Promise<SupportRequestSummary[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ clientId, status: "open" })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toSummary);
}

export async function listOpenSupportRequestGroups(): Promise<SupportRequestGroup[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ status: "open" })
    .sort({ createdAt: -1 })
    .toArray();

  const groups = new Map<string, SupportRequestGroup>();
  for (const doc of docs) {
    const summary = toSummary(doc);
    const existing = groups.get(doc.clientId);
    if (existing) {
      existing.items.push(summary);
    } else {
      groups.set(doc.clientId, {
        clientId: doc.clientId,
        clientName: doc.clientName,
        items: [summary],
      });
    }
  }
  return Array.from(groups.values());
}

export async function getSupportRequestDetails(
  id: string
): Promise<SupportRequestDetails | null> {
  const collection = await getCollection();
  const found = await collection.findOne({ _id: id });
  return found ? toDetails(found) : null;
}
