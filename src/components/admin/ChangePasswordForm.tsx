"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-mint-600 focus:outline-none";

interface ChangePasswordFormProps {
  onSubmit: (newPassword: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function ChangePasswordForm({
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          New Password
        </label>
        <input
          required
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          required
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-mint-600 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Password"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
