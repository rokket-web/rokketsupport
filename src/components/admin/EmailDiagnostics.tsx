"use client";

import { useState } from "react";
import {
  getEmailConfigStatusAction,
  sendTestEmailAction,
  type EmailConfigStatus,
} from "@/app/actions/diagnostics";

function StatusRow({ label, value }: { label: string; value: string }) {
  const isMissing = value === "Not set";
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span
        className={
          isMissing ? "font-medium text-red-600" : "font-mono text-gray-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function EmailDiagnostics() {
  const [status, setStatus] = useState<EmailConfigStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<
    { success: true; sentTo: string } | { success: false; error: string } | null
  >(null);

  async function handleCheckConfig() {
    setChecking(true);
    setCheckError(null);
    try {
      const result = await getEmailConfigStatusAction();
      setStatus(result);
    } catch (error) {
      setCheckError(error instanceof Error ? error.message : String(error));
    } finally {
      setChecking(false);
    }
  }

  async function handleSendTest() {
    setSending(true);
    setSendResult(null);
    try {
      const result = await sendTestEmailAction();
      setSendResult(result);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Email Diagnostics</h2>
      <p className="mt-1 text-sm text-gray-500">
        Check whether email environment variables are configured on this
        deployment, and send a real test email through Mailgun to confirm
        delivery actually works.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Configuration</h3>
          <button
            type="button"
            onClick={handleCheckConfig}
            disabled={checking}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Configuration"}
          </button>
        </div>

        {checkError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {checkError}
          </p>
        )}

        {status && (
          <div className="mt-3">
            <StatusRow label="SMTP_HOST" value={status.smtpHost ?? "Not set"} />
            <StatusRow label="SMTP_PORT" value={status.smtpPort ?? "Not set"} />
            <StatusRow label="SMTP_USER" value={status.smtpUser ?? "Not set"} />
            <StatusRow
              label="SMTP_PASSWORD"
              value={status.hasSmtpPassword ? "Set" : "Not set"}
            />
            <StatusRow label="EMAIL_FROM" value={status.emailFrom ?? "Not set"} />
            <StatusRow
              label="ADMIN_NOTIFICATION_EMAIL"
              value={status.adminNotificationEmail ?? "Not set"}
            />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Send Test Email</h3>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={sending}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Test Email"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Sends a real email to ADMIN_NOTIFICATION_EMAIL through your live
          Mailgun SMTP credentials and reports the exact result.
        </p>

        {sendResult && (
          <p
            className={`mt-3 text-sm ${
              sendResult.success ? "text-green-700" : "text-red-600"
            }`}
            role="alert"
          >
            {sendResult.success
              ? `Sent successfully to ${sendResult.sentTo}.`
              : sendResult.error}
          </p>
        )}
      </div>
    </div>
  );
}
