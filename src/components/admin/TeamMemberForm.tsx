"use client";

import { useState } from "react";
import type { UserRole } from "@/lib/users";

export interface TeamMemberFormValues {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
}

const EMPTY_VALUES: TeamMemberFormValues = {
  name: "",
  username: "",
  email: "",
  role: "team_member",
  password: "",
};

const inputClasses =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none";
const labelClasses = "mb-1 block text-sm font-medium text-gray-700";

interface TeamMemberFormProps {
  initialValues?: TeamMemberFormValues;
  submitLabel?: string;
  error?: string | null;
  onSubmit: (values: TeamMemberFormValues) => void;
  onCancel: () => void;
}

export default function TeamMemberForm({
  initialValues,
  submitLabel = "Save Team Member",
  error,
  onSubmit,
  onCancel,
}: TeamMemberFormProps) {
  const [values, setValues] = useState<TeamMemberFormValues>(
    initialValues ?? EMPTY_VALUES
  );
  const isEditing = Boolean(initialValues);

  function update<K extends keyof TeamMemberFormValues>(
    key: K,
    value: TeamMemberFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <label className={labelClasses}>Name</label>
        <input
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Username</label>
        <input
          required
          value={values.username}
          onChange={(e) => update("username", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Email</label>
        <input
          required
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Role</label>
        <select
          value={values.role}
          onChange={(e) => update("role", e.target.value as UserRole)}
          className={`${inputClasses} bg-white`}
        >
          <option value="admin">Admin</option>
          <option value="team_member">Team Member</option>
        </select>
      </div>

      {!isEditing && (
        <div>
          <label className={labelClasses}>Password</label>
          <input
            required
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClasses}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
