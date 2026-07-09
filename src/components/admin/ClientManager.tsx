"use client";

import { useState } from "react";
import ClientForm, { type ClientFormValues } from "./ClientForm";
import ChangePasswordForm from "./ChangePasswordForm";
import {
  addClientAction,
  getClientCredentialsAction,
  getClientSftpCredentialsAction,
  setClientPortalPasswordAction,
  updateClientAction,
} from "@/app/actions/clients";
import { loginToClientSite, normalizeUrl } from "@/lib/clientLogin";
import type { ClientRecord } from "@/lib/clients";
import type { TeamMemberRecord } from "@/lib/userStore";

interface ClientManagerProps {
  initialClients: ClientRecord[];
  teamMembers: TeamMemberRecord[];
}

function clientToFormValues(client: ClientRecord): ClientFormValues {
  return {
    name: client.name,
    email: client.email ?? "",
    websiteUrl: client.websiteUrl,
    loginUrl: client.loginUrl,
    platform: client.platform,
    customPlatform: client.customPlatform ?? "",
    adminUsername: client.adminUsername,
    password: "",
    sftpUsername: client.sftpUsername ?? "",
    sftpPassword: "",
    portalUsername: client.portalUsername ?? "",
    defaultAssigneeId: client.defaultAssigneeId ?? "",
  };
}

export default function ClientManager({ initialClients, teamMembers }: ClientManagerProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingInId, setLoggingInId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyingPasswordId, setCopyingPasswordId] = useState<string | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [copyingSftpPasswordId, setCopyingSftpPasswordId] = useState<string | null>(null);
  const [copiedSftpPasswordId, setCopiedSftpPasswordId] = useState<string | null>(null);
  const [showChangePortalPassword, setShowChangePortalPassword] = useState(false);
  const [portalPasswordChangedId, setPortalPasswordChangedId] = useState<string | null>(null);

  // selectedClientId drives the slide-in/out animation; panelClient holds the
  // last-opened client so the panel's content doesn't disappear mid-animation
  // while it's sliding closed.
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [panelClient, setPanelClient] = useState<ClientRecord | null>(null);

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

  function openDetails(client: ClientRecord) {
    setPanelClient(client);
    setSelectedClientId(client.id);
    setShowChangePortalPassword(false);
  }

  function closeDetails() {
    setSelectedClientId(null);
  }

  async function handleAddClient(values: ClientFormValues) {
    setSaving(true);
    try {
      const assignee = teamMembers.find((m) => m.id === values.defaultAssigneeId);
      const newClient = await addClientAction({
        name: values.name,
        email: values.email,
        websiteUrl: values.websiteUrl,
        loginUrl: values.loginUrl,
        platform: values.platform,
        customPlatform: values.platform === "Other" ? values.customPlatform : undefined,
        adminUsername: values.adminUsername,
        password: values.password,
        sftpUsername: values.sftpUsername || undefined,
        sftpPassword: values.sftpPassword || undefined,
        portalUsername: values.portalUsername || undefined,
        defaultAssigneeId: assignee?.id,
        defaultAssigneeName: assignee?.name,
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
      const assignee = teamMembers.find((m) => m.id === values.defaultAssigneeId);
      const updated = await updateClientAction({
        id: editingClient.id,
        name: values.name,
        email: values.email,
        websiteUrl: values.websiteUrl,
        loginUrl: values.loginUrl,
        platform: values.platform,
        customPlatform: values.platform === "Other" ? values.customPlatform : undefined,
        adminUsername: values.adminUsername,
        password: values.password.trim() ? values.password : undefined,
        sftpUsername: values.sftpUsername || undefined,
        sftpPassword: values.sftpPassword.trim() ? values.sftpPassword : undefined,
        portalUsername: values.portalUsername || undefined,
        defaultAssigneeId: assignee?.id,
        defaultAssigneeName: assignee?.name,
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

  async function handleCopyPassword(client: ClientRecord) {
    setCopyingPasswordId(client.id);
    try {
      const credentials = await getClientCredentialsAction(client.id);
      if (!credentials) return;
      await navigator.clipboard.writeText(credentials.password);
      setCopiedPasswordId(client.id);
      setTimeout(() => {
        setCopiedPasswordId((current) => (current === client.id ? null : current));
      }, 2000);
    } finally {
      setCopyingPasswordId(null);
    }
  }

  async function handleCopySftpPassword(client: ClientRecord) {
    setCopyingSftpPasswordId(client.id);
    try {
      const credentials = await getClientSftpCredentialsAction(client.id);
      if (!credentials) return;
      await navigator.clipboard.writeText(credentials.password);
      setCopiedSftpPasswordId(client.id);
      setTimeout(() => {
        setCopiedSftpPasswordId((current) => (current === client.id ? null : current));
      }, 2000);
    } finally {
      setCopyingSftpPasswordId(null);
    }
  }

  async function handleChangePortalPassword(newPassword: string) {
    if (!panelClient) return;
    await setClientPortalPasswordAction(panelClient.id, newPassword);
    setShowChangePortalPassword(false);
    setPanelClient((prev) => (prev ? { ...prev, hasPortalPassword: true } : prev));
    setClients((prev) =>
      prev.map((c) => (c.id === panelClient.id ? { ...c, hasPortalPassword: true } : c))
    );
    setPortalPasswordChangedId(panelClient.id);
    setTimeout(() => {
      setPortalPasswordChangedId((current) => (current === panelClient.id ? null : current));
    }, 2000);
  }

  const isPanelOpen = selectedClientId !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <button
          type="button"
          onClick={showForm ? closeForm : openAddForm}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-mint-600"
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
            teamMembers={teamMembers}
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            onCancel={closeForm}
          />
          {saving && (
            <p className="mt-2 text-sm text-gray-500">Saving client...</p>
          )}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No clients yet. Client accounts will appear here.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {clients.map((client) => (
            <li key={client.id}>
              <button
                type="button"
                onClick={() => openDetails(client)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{client.name}</span>
                <span className="text-gray-400">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Overlay */}
      <div
        aria-hidden={!isPanelOpen}
        onClick={closeDetails}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isPanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-over details panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {panelClient && (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {panelClient.name}
              </h3>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close"
                className="text-xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Website URL
              </p>
              <a
                href={normalizeUrl(panelClient.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-gray-900 underline hover:text-gray-700"
              >
                {panelClient.websiteUrl}
              </a>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Login URL
              </p>
              <a
                href={normalizeUrl(panelClient.loginUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-gray-900 underline hover:text-gray-700"
              >
                {panelClient.loginUrl}
              </a>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Platform
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.platform === "Other"
                  ? panelClient.customPlatform
                  : panelClient.platform}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Admin Username
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.adminUsername}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Password
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="tracking-widest text-gray-400">
                  ••••••••
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPassword(panelClient)}
                  disabled={copyingPasswordId === panelClient.id}
                  className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {copyingPasswordId === panelClient.id
                    ? "Copying..."
                    : copiedPasswordId === panelClient.id
                      ? "Copied!"
                      : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                SFTP Username
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.sftpUsername || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                SFTP Password
              </p>
              {panelClient.hasSftpPassword ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="tracking-widest text-gray-400">
                    ••••••••
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySftpPassword(panelClient)}
                    disabled={copyingSftpPasswordId === panelClient.id}
                    className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {copyingSftpPasswordId === panelClient.id
                      ? "Copying..."
                      : copiedSftpPasswordId === panelClient.id
                        ? "Copied!"
                        : "Copy"}
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-400">—</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Portal Username
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.portalUsername || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Portal Password
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="tracking-widest text-gray-400">
                  {panelClient.hasPortalPassword ? "••••••••" : "Not set"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowChangePortalPassword((prev) => !prev)}
                  className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {portalPasswordChangedId === panelClient.id
                    ? "Changed!"
                    : showChangePortalPassword
                      ? "Cancel"
                      : panelClient.hasPortalPassword
                        ? "Reset Password"
                        : "Set Password"}
                </button>
              </div>
              {showChangePortalPassword && (
                <ChangePasswordForm
                  onSubmit={handleChangePortalPassword}
                  onCancel={() => setShowChangePortalPassword(false)}
                />
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Default Assignee
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelClient.defaultAssigneeName || "Unassigned"}
              </p>
            </div>

            <div className="mt-2 flex gap-3 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => {
                  openEditForm(panelClient);
                  closeDetails();
                }}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleLogin(panelClient)}
                disabled={loggingInId === panelClient.id}
                className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-mint-600 disabled:opacity-50"
              >
                {loggingInId === panelClient.id
                  ? "Logging in..."
                  : copiedId === panelClient.id
                    ? "Copied!"
                    : "Login"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
