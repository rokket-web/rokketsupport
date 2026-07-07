"use client";

import { useState } from "react";
import TeamMemberForm, { type TeamMemberFormValues } from "./TeamMemberForm";
import ChangePasswordForm from "./ChangePasswordForm";
import {
  addTeamMemberAction,
  changeTeamMemberPasswordAction,
  updateTeamMemberAction,
} from "@/app/actions/team";
import type { TeamMemberRecord } from "@/lib/userStore";

interface TeamManagerProps {
  initialTeamMembers: TeamMemberRecord[];
}

function memberToFormValues(member: TeamMemberRecord): TeamMemberFormValues {
  return {
    name: member.name,
    username: member.username,
    email: member.email,
    role: member.role,
    password: "",
  };
}

export default function TeamManager({ initialTeamMembers }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMemberRecord[]>(initialTeamMembers);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [panelMember, setPanelMember] = useState<TeamMemberRecord | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordChangedId, setPasswordChangedId] = useState<string | null>(null);

  function openAddForm() {
    setEditingMember(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(member: TeamMemberRecord) {
    setEditingMember(member);
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMember(null);
    setFormError(null);
  }

  function openDetails(member: TeamMemberRecord) {
    setPanelMember(member);
    setSelectedMemberId(member.id);
    setShowChangePassword(false);
  }

  function closeDetails() {
    setSelectedMemberId(null);
    setShowChangePassword(false);
  }

  async function handleAddMember(values: TeamMemberFormValues) {
    setSaving(true);
    setFormError(null);
    try {
      const newMember = await addTeamMemberAction({
        name: values.name,
        username: values.username,
        email: values.email,
        role: values.role,
        password: values.password,
      });
      setMembers((prev) => [...prev, newMember]);
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateMember(values: TeamMemberFormValues) {
    if (!editingMember) return;
    setSaving(true);
    setFormError(null);
    try {
      const updated = await updateTeamMemberAction({
        id: editingMember.id,
        name: values.name,
        username: values.username,
        email: values.email,
        role: values.role,
      });
      if (updated) {
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(newPassword: string) {
    if (!panelMember) return;
    await changeTeamMemberPasswordAction(panelMember.id, newPassword);
    setShowChangePassword(false);
    setPasswordChangedId(panelMember.id);
    setTimeout(() => {
      setPasswordChangedId((current) => (current === panelMember.id ? null : current));
    }, 2000);
  }

  const isPanelOpen = selectedMemberId !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <button
          type="button"
          onClick={showForm ? closeForm : openAddForm}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {showForm ? "Close" : "Add Team Member"}
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <TeamMemberForm
            key={editingMember?.id ?? "new"}
            initialValues={editingMember ? memberToFormValues(editingMember) : undefined}
            submitLabel={editingMember ? "Update Team Member" : "Save Team Member"}
            error={formError}
            onSubmit={editingMember ? handleUpdateMember : handleAddMember}
            onCancel={closeForm}
          />
          {saving && (
            <p className="mt-2 text-sm text-gray-500">Saving team member...</p>
          )}
        </div>
      )}

      {members.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No team members yet.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {members.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => openDetails(member)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{member.name}</span>
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
        {panelMember && (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {panelMember.name}
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
                Username
              </p>
              <p className="mt-1 text-sm text-gray-900">{panelMember.username}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {panelMember.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Role
              </p>
              <p className="mt-1 text-sm capitalize text-gray-900">
                {panelMember.role.replace("_", " ")}
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
                  onClick={() => setShowChangePassword((prev) => !prev)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {passwordChangedId === panelMember.id
                    ? "Changed!"
                    : showChangePassword
                      ? "Cancel"
                      : "Change Password"}
                </button>
              </div>
              {showChangePassword && (
                <ChangePasswordForm
                  onSubmit={handleChangePassword}
                  onCancel={() => setShowChangePassword(false)}
                />
              )}
            </div>

            <div className="mt-2 flex gap-3 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => {
                  openEditForm(panelMember);
                  closeDetails();
                }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
