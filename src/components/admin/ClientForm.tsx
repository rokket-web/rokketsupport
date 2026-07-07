"use client";

import { useState } from "react";
import { CLIENT_PLATFORMS, type ClientPlatform } from "@/lib/clients";

export interface ClientFormValues {
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform: string;
  adminUsername: string;
  password: string;
}

const EMPTY_VALUES: ClientFormValues = {
  name: "",
  websiteUrl: "",
  loginUrl: "",
  platform: "WordPress",
  customPlatform: "",
  adminUsername: "",
  password: "",
};

const inputClasses =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none";
const labelClasses = "mb-1 block text-sm font-medium text-gray-700";

interface ClientFormProps {
  initialValues?: ClientFormValues;
  submitLabel?: string;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}

export default function ClientForm({
  initialValues,
  submitLabel = "Save Client",
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
      className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2"
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
