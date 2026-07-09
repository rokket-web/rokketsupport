"use server";

import { revalidatePath } from "next/cache";
import { getClientSession } from "@/lib/clientAuth";
import { getClientById } from "@/lib/clientStore";
import { getTeamMemberById } from "@/lib/userStore";
import {
  addSupportRequest,
  getSupportRequestDetails,
  reassignSupportRequest,
  updateSupportRequestStatus,
} from "@/lib/supportRequestStore";
import { sendEmail } from "@/lib/mail";
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  type SupportRequestDetails,
  type SupportRequestStatus,
  type SupportRequestSummary,
} from "@/lib/supportRequests";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB per image
const LOGIN_URL = "https://support.rokket.us";

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

// Notifies a team member that a support request is (now) theirs. Failures
// are logged, never thrown — a broken notification email must never block
// the underlying submit/reassign action from succeeding.
async function sendAssignmentEmail(params: {
  to: string;
  teamMemberName: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
  description: string;
}): Promise<void> {
  try {
    await sendEmail({
      to: params.to,
      subject: `Support request assigned to you: ${params.issue}`,
      text: `Hi ${params.teamMemberName},\n\nYou've been assigned a support request:\n\nClient: ${params.clientName}\nWebsite: ${params.websiteUrl}\nIssue: ${params.issue}\n\n${params.description}\n\nLog in to view details and update its status: ${LOGIN_URL}`,
      html: `
        <p>Hi ${escapeHtml(params.teamMemberName)},</p>
        <p>You've been assigned a support request:</p>
        <p><strong>Client:</strong> ${escapeHtml(params.clientName)}</p>
        <p><strong>Website:</strong> ${escapeHtml(params.websiteUrl)}</p>
        <p><strong>Issue:</strong> ${escapeHtml(params.issue)}</p>
        <p>${escapeHtml(params.description).replace(/\n/g, "<br/>")}</p>
        <p style="margin-top: 24px;">
          <a
            href="${LOGIN_URL}"
            style="display: inline-block; padding: 10px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold;"
          >
            Log In
          </a>
        </p>
      `,
    });
  } catch (error) {
    console.error(
      "[sendAssignmentEmail] Failed to send assignment email:",
      error
    );
  }
}

// Notifies a client that the status of their support request has changed.
// Failures are logged, never thrown — a broken notification email must
// never block the underlying status-update action from succeeding.
async function sendStatusChangeEmail(params: {
  to: string;
  clientName: string;
  issue: string;
  status: SupportRequestStatus;
}): Promise<void> {
  const statusLabel = SUPPORT_REQUEST_STATUS_LABELS[params.status];
  try {
    await sendEmail({
      to: params.to,
      subject: `Support request update: ${params.issue}`,
      text: `Hi ${params.clientName},\n\nThe status of your support request "${params.issue}" has been updated to: ${statusLabel}.\n\nLog in to view details: ${LOGIN_URL}`,
      html: `
        <p>Hi ${escapeHtml(params.clientName)},</p>
        <p>The status of your support request <strong>${escapeHtml(params.issue)}</strong> has been updated to:</p>
        <p style="font-size: 16px; font-weight: bold;">${escapeHtml(statusLabel)}</p>
        <p style="margin-top: 24px;">
          <a
            href="${LOGIN_URL}"
            style="display: inline-block; padding: 10px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold;"
          >
            Log In
          </a>
        </p>
      `,
    });
  } catch (error) {
    console.error(
      "[sendStatusChangeEmail] Failed to send status update email:",
      error
    );
  }
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
    assigneeId: client.defaultAssigneeId,
    assigneeName: client.defaultAssigneeName,
  });

  // A failed or misconfigured notification email must never block the
  // client's request from being saved — log it clearly (visible in the
  // host's function logs) instead of throwing.
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn(
      "[submitSupportRequestAction] ADMIN_NOTIFICATION_EMAIL is not set — skipping notification email. Set it in your hosting provider's environment variables to enable notifications."
    );
  } else {
    try {
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
    } catch (error) {
      console.error(
        "[submitSupportRequestAction] Failed to send notification email:",
        error
      );
    }
  }

  if (client.defaultAssigneeId) {
    const assignee = await getTeamMemberById(client.defaultAssigneeId);
    if (assignee?.email) {
      await sendAssignmentEmail({
        to: assignee.email,
        teamMemberName: assignee.name,
        clientName: client.name,
        websiteUrl: client.websiteUrl,
        issue,
        description,
      });
    }
  }

  revalidatePath("/client-dashboard");
  revalidatePath("/admin");
  revalidatePath("/my-projects");
  return { success: true, request };
}

export async function getSupportRequestDetailsAction(
  id: string
): Promise<SupportRequestDetails | null> {
  return getSupportRequestDetails(id);
}

export async function updateSupportRequestStatusAction(
  id: string,
  status: SupportRequestStatus
): Promise<SupportRequestSummary | null> {
  const updated = await updateSupportRequestStatus(id, status);

  if (updated) {
    const client = await getClientById(updated.clientId);
    if (client?.email) {
      await sendStatusChangeEmail({
        to: client.email,
        clientName: client.name,
        issue: updated.issue,
        status,
      });
    } else {
      console.warn(
        `[updateSupportRequestStatusAction] Client ${updated.clientId} has no email on file — skipping status update notification.`
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/client-dashboard");
  revalidatePath("/my-projects");
  return updated;
}

export async function reassignSupportRequestAction(
  id: string,
  assigneeId: string | null
): Promise<SupportRequestSummary | null> {
  let assigneeName: string | undefined;
  let assigneeEmail: string | undefined;
  if (assigneeId) {
    const teamMember = await getTeamMemberById(assigneeId);
    if (!teamMember) {
      return null;
    }
    assigneeName = teamMember.name;
    assigneeEmail = teamMember.email;
  }

  const updated = await reassignSupportRequest(
    id,
    assigneeId ?? undefined,
    assigneeName
  );

  if (updated && assigneeEmail && assigneeName) {
    const details = await getSupportRequestDetails(id);
    if (details) {
      await sendAssignmentEmail({
        to: assigneeEmail,
        teamMemberName: assigneeName,
        clientName: details.clientName,
        websiteUrl: details.websiteUrl,
        issue: details.issue,
        description: details.description,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/my-projects");
  return updated;
}
