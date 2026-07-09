"use client";

import { useState } from "react";
import { CLIENT_PLATFORMS, type ClientPlatform } from "@/lib/clients";
import type { TeamMemberRecord } from "@/lib/userStore";

export interface ClientFormValues {
  name: string;
  email: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform: string;
  adminUsername: string;
  password: string;
  sftpUsername: string;
  sftpPassword: string;
  portalUsername: string;
  defaultAssigneeId: string;
}

const EMPTY_VALUES: ClientFormValues = {
  name: "",
  email: "",
  websiteUrl: "",
  loginUrl: "",
  platform: "WordPress",
  customPlatform: "",
  adminUsername: "",
  password: "",
  sftpUsername: "",
  sftpPassword: "",
  portalUsername: "",
  defaultAssigneeId: "",
};

const inputClasses =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-mint-600 focus:outline-none";
const labelClasses = "mb-1 block text-sm font-medium text-gray-700";

interface ClientFormProps {
  initialValues?: ClientFormValues;
  submitLabel?: string;
  teamMembers: TeamMemberRecord[];
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}

export default function ClientForm({
  initialValues,
  submitLabel = "Save Client",
  teamMembers,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(
    initialValues ?? EMPTY_VALUES
  );
  const isEditing = Boolean(initialValues);

  function update<K extends keyof ClientFormValues>(
    key: K,
    value: ClientFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(values);
    if (!isEditing) {
      setValues(EMPTY_VALUES);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2"
    >
      <div>
        <label className={labelClasses}>Client Name</label>
        <input
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Email</label>
        <input
          required
          type="email"
          placeholder="client@example.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-gray-500">
          Used to notify the client when a support request&apos;s status changes.
        </p>
      </div>

      <div>
        <label className={labelClasses}>Website URL</label>
        <input
          required
          type="url"
          placeholder="https://example.com"
          value={values.websiteUrl}
          onChange={(e) => update("websiteUrl", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Website Login URL</label>
        <input
          required
          type="url"
          placeholder="https://example.com/wp-login.php"
          value={values.loginUrl}
          onChange={(e) => update("loginUrl", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Platform</label>
        <select
          value={values.platform}
          onChange={(e) => update("platform", e.target.value as ClientPlatform)}
          className={`${inputClasses} bg-white`}
        >
          {CLIENT_PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </div>

      {values.platform === "Other" && (
        <div>
          <label className={labelClasses}>Platform Name</label>
          <input
            required
            value={values.customPlatform}
            onChange={(e) => update("customPlatform", e.target.value)}
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <label className={labelClasses}>Admin Username</label>
        <input
          required
          value={values.adminUsername}
          onChange={(e) => update("adminUsername", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Password</label>
        <input
          required={!isEditing}
          type="password"
          autoComplete="new-password"
          placeholder={isEditing ? "Leave blank to keep current password" : undefined}
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>SFTP Username</label>
        <input
          value={values.sftpUsername}
          onChange={(e) => update("sftpUsername", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>SFTP Password</label>
        <input
          type="password"
          autoComplete="new-password"
          placeholder={isEditing ? "Leave blank to keep current password" : undefined}
          value={values.sftpPassword}
          onChange={(e) => update("sftpPassword", e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClasses}>Portal Username</label>
        <input
          placeholder="Username for this client's support portal login"
          value={values.portalUsername}
          onChange={(e) => update("portalUsername", e.target.value)}
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate from the website admin login above. Set or reset the
          portal password from the client&apos;s detail panel after saving.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className={labelClasses}>Default Assignee</label>
        <select
          value={values.defaultAssigneeId}
          onChange={(e) => update("defaultAssigneeId", e.target.value)}
          className={`${inputClasses} bg-white`}
        >
          <option value="">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Support requests submitted by this client are automatically assigned
          to this team member.
        </p>
      </div>

      <div className="flex items-end gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-mint-600"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
