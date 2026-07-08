"use server";

import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";

async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export interface EmailConfigStatus {
  smtpHost: string | null;
  smtpPort: string | null;
  smtpUser: string | null;
  hasSmtpPassword: boolean;
  emailFrom: string | null;
  adminNotificationEmail: string | null;
}

export async function getEmailConfigStatusAction(): Promise<EmailConfigStatus> {
  await requireAdmin();
  return {
    smtpHost: process.env.SMTP_HOST || null,
    smtpPort: process.env.SMTP_PORT || null,
    smtpUser: process.env.SMTP_USER || null,
    hasSmtpPassword: Boolean(process.env.SMTP_PASSWORD),
    emailFrom: process.env.EMAIL_FROM || null,
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || null,
  };
}

export type SendTestEmailResult =
  | { success: true; sentTo: string }
  | { success: false; error: string };

export async function sendTestEmailAction(): Promise<SendTestEmailResult> {
  await requireAdmin();

  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) {
    return {
      success: false,
      error:
        "ADMIN_NOTIFICATION_EMAIL is not set, so there's no address to send the test to.",
    };
  }

  try {
    await sendEmail({
      to,
      subject: "Rokket Support — test email",
      text: `This is a test email sent from the admin dashboard diagnostics panel at ${new Date().toISOString()}.`,
    });
    return { success: true, sentTo: to };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
