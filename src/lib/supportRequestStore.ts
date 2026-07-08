import "server-only";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import type {
  SupportRequestSummary,
  SupportRequestDetails,
  SupportRequestGroup,
  SupportRequestGroups,
  SupportRequestStatus,
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
  status: SupportRequestStatus;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: Date;
}

export interface AddSupportRequestInput {
  clientId: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
  description: string;
  images: SupportRequestImageDoc[];
  assigneeId?: string;
  assigneeName?: string;
}

async function getCollection() {
  const db = await getDb();
  return db.collection<SupportRequestDoc>("support_requests");
}

// Requests created before the Active/In Progress/Complete statuses existed
// were stored with "open"/"closed". Normalize those (and anything else
// unrecognized) so old records don't render a blank, uncolored badge.
function normalizeStatus(status: SupportRequestDoc["status"]): SupportRequestStatus {
  if (status === "active" || status === "in_progress" || status === "complete") {
    return status;
  }
  return status === "closed" ? "complete" : "active";
}

function toSummary(doc: SupportRequestDoc): SupportRequestSummary {
  return {
    id: doc._id,
    clientId: doc.clientId,
    clientName: doc.clientName,
    websiteUrl: doc.websiteUrl,
    issue: doc.issue,
    status: normalizeStatus(doc.status),
    assigneeId: doc.assigneeId,
    assigneeName: doc.assigneeName,
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
    status: "active",
    assigneeId: input.assigneeId,
    assigneeName: input.assigneeName,
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
    .find({ clientId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toSummary);
}

function groupDocs(docs: SupportRequestDoc[]): SupportRequestGroups {
  const activeGroups = new Map<string, SupportRequestGroup>();
  const completedGroups = new Map<string, SupportRequestGroup>();

  for (const doc of docs) {
    const summary = toSummary(doc);
    const groups = summary.status === "complete" ? completedGroups : activeGroups;
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

  return {
    active: Array.from(activeGroups.values()),
    completed: Array.from(completedGroups.values()),
  };
}

export async function listSupportRequestGroups(): Promise<SupportRequestGroups> {
  const collection = await getCollection();
  const docs = await collection.find().sort({ createdAt: -1 }).toArray();
  return groupDocs(docs);
}

export async function listSupportRequestGroupsForAssignee(
  assigneeId: string
): Promise<SupportRequestGroups> {
  const collection = await getCollection();
  const docs = await collection
    .find({ assigneeId })
    .sort({ createdAt: -1 })
    .toArray();
  return groupDocs(docs);
}

export async function getSupportRequestDetails(
  id: string
): Promise<SupportRequestDetails | null> {
  const collection = await getCollection();
  const found = await collection.findOne({ _id: id });
  return found ? toDetails(found) : null;
}

export async function updateSupportRequestStatus(
  id: string,
  status: SupportRequestStatus
): Promise<SupportRequestSummary | null> {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: { status } },
    { returnDocument: "after" }
  );
  return result ? toSummary(result) : null;
}

export async function reassignSupportRequest(
  id: string,
  assigneeId: string | undefined,
  assigneeName: string | undefined
): Promise<SupportRequestSummary | null> {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: id },
    assigneeId
      ? { $set: { assigneeId, assigneeName } }
      : { $unset: { assigneeId: "", assigneeName: "" } },
    { returnDocument: "after" }
  );
  return result ? toSummary(result) : null;
}
