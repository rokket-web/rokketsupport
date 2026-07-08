"use server";

import { revalidatePath } from "next/cache";
import { getClientSession } from "@/lib/clientAuth";
import { getClientById } from "@/lib/clientStore";
import {
  addSupportRequest,
  getSupportRequestDetails,
} from "@/lib/supportRequestStore";
import { sendEmail } from "@/lib/mail";
import type {
  SupportRequestDetails,
  SupportRequestSummary,
} from "@/lib/supportRequests";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB per image

export type SubmitSupportRequestResult =
  | { success: true; request: SupportRequestSummary }
  | { success: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitSupportRequestAction(
  formData: FormData
): Promise<SubmitSupportRequestResult> {
  const session = await getClientSession();
  if (!session) {
    return {
      success: false,
      error: "You must be logged in to submit a support request.",
    };
  }

  const client = await getClientById(session.clientId);
  if (!client) {
    return { success: false, error: "Client account not found." };
  }

  const issue = String(formData.get("issue") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!issue || !description) {
    return {
      success: false,
      error: "Please fill out the issue and description.",
    };
  }

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_IMAGES) {
    return { success: false, error: `Please attach at most ${MAX_IMAGES} images.` };
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed." };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { success: false, error: "Each image must be smaller than 4MB." };
    }
  }

  const images = await Promise.all(
    files.map(async (file) => ({
      contentType: file.type,
      filename: file.name,
      data: Buffer.from(await file.arrayBuffer()),
    }))
  );

  const request = await addSupportRequest({
    clientId: client.id,
    clientName: client.name,
    websiteUrl: client.websiteUrl,
    issue,
    description,
    images: images.map(({ contentType, data }) => ({ contentType, data })),
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Support request: ${client.name} — ${issue}`,
      text: `Client: ${client.name}\nWebsite: ${client.websiteUrl}\nIssue: ${issue}\n\n${description}`,
      html: `
        <p><strong>Client:</strong> ${escapeHtml(client.name)}</p>
        <p><strong>Website:</strong> ${escapeHtml(client.websiteUrl)}</p>
        <p><strong>Issue:</strong> ${escapeHtml(issue)}</p>
        <p>${escapeHtml(description).replace(/\n/g, "<br/>")}</p>
      `,
      attachments: images.map((img, index) => ({
        filename: img.filename || `screenshot-${index + 1}`,
        content: img.data,
        contentType: img.contentType,
      })),
    });
  }

  revalidatePath("/client-dashboard");
  revalidatePath("/admin");
  return { success: true, request };
}

export async function getSupportRequestDetailsAction(
  id: string
): Promise<SupportRequestDetails | null> {
  return getSupportRequestDetails(id);
}
