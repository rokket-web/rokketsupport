"use client";

import { useState } from "react";
import ClientForm, { type ClientFormValues } from "./ClientForm";
import {
  addClientAction,
  getClientCredentialsAction,
  updateClientAction,
} from "@/app/actions/clients";
import { loginToClientSite, normalizeUrl } from "@/lib/clientLogin";
import type { ClientRecord } from "@/lib/clients";

interface ClientManagerProps {
  initialClients: ClientRecord[];
}

function clientToFormValues(client: ClientRecord): ClientFormValues {
  return {
    name: client.name,
    websiteUrl: client.websiteUrl,
    loginUrl: client.loginUrl,
    platform: client.platform,
    customPlatform: client.customPlatform ?? "",
    adminUsername: client.adminUsername,
    password: "",
  };
}

export default function ClientManager({ initialClients }: ClientManagerProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingInId, setLoggingInId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function openAddForm() {
    setEditingClient(null);
    setShowForm(true);
  }

  function openEditForm(client: ClientRecord) {
    setEditingClient(client);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingClient(null);
  }

  async function handleAddClient(values: ClientFormValues) {
    setSaving(true);
    try {
      const newClient = await addClientAction({
        name: values.name,
        websiteUrl: values.websiteUrl,
        loginUrl: values.loginUrl,
        platform: values.platform,
        customPlatform: values.platform === "Other" ? values.customPlatform : undefined,
        adminUsername: values.adminUsername,
        password: values.password,
      });
      setClients((prev) => [...prev, newClient]);
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateClient(values: ClientFormValues) {
    if (!editingClient) return;
    setSaving(true);
    try {
      const updated = await updateClientAction({
        id: editingClient.id,
        name: values.name,
        websiteUrl: values.websiteUrl,
        loginUrl: values.loginUrl,
        platform: values.platform,
        customPlatform: values.platform === "Other" ? values.customPlatform : undefined,
        adminUsername: values.adminUsername,
        password: values.password.trim() ? values.password : undefined,
      });
      if (updated) {
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin(client: ClientRecord) {
    setLoggingInId(client.id);
    try {
      const credentials = await getClientCredentialsAction(client.id);
      if (!credentials) return;
      const { copiedToClipboard } = await loginToClientSite(
        client.platform,
        client.loginUrl,
        credentials.username,
        credentials.password
      );
      if (copiedToClipboard) {
        setCopiedId(client.id);
        setTimeout(() => {
          setCopiedId((current) => (current === client.id ? null : current));
        }, 2000);
      }
    } finally {
      setLoggingInId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <button
          type="button"
          onClick={showForm ? closeForm : openAddForm}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {showForm ? "Close" : "Add Client"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <ClientForm
            key={editingClient?.id ?? "new"}
            initialValues={editingClient ? clientToFormValues(editingClient) : undefined}
            submitLabel={editingClient ? "Update Client" : "Save Client"}
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            onCancel={closeForm}
          />
          {saving && (
            <p className="mt-2 text-sm text-gray-500">Saving client...</p>
          )}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No clients yet. Client accounts will appear here.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Client Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Website URL
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Login URL
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Platform
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Admin Username
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Password
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-4 py-3 text-gray-900">{client.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <a
                      href={normalizeUrl(client.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-900"
                    >
                      {client.websiteUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a
                      href={normalizeUrl(client.loginUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-900"
                    >
                      {client.loginUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.platform === "Other"
                      ? client.customPlatform
                      : client.platform}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.adminUsername}
                  </td>
                  <td className="px-4 py-3 tracking-widest text-gray-400">
                    ••••••••
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(client)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogin(client)}
                        disabled={loggingInId === client.id}
                        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        {loggingInId === client.id
                          ? "Logging in..."
                          : copiedId === client.id
                            ? "Copied!"
                            : "Login"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
