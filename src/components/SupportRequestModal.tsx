"use client";

import { useState } from "react";
import {
  reassignSupportRequestAction,
  updateSupportRequestStatusAction,
} from "@/app/actions/support";
import {
  SUPPORT_REQUEST_STATUSES,
  SUPPORT_REQUEST_STATUS_COLORS,
  SUPPORT_REQUEST_STATUS_LABELS,
  type SupportRequestDetails,
  type SupportRequestStatus,
} from "@/lib/supportRequests";
import type { TeamMemberRecord } from "@/lib/userStore";

interface SupportRequestModalProps {
  request: SupportRequestDetails;
  onClose: () => void;
  onStatusChange: (id: string, status: SupportRequestStatus) => void;
  // Only pass teamMembers (and handle onAssigneeChange) for admin-facing
  // usage — omitting it hides the reassignment control entirely, which is
  // how the team member's own dashboard uses this same modal.
  teamMembers?: TeamMemberRecord[];
  onAssigneeChange?: (id: string, assigneeId?: string, assigneeName?: string) => void;
}

const UNASSIGNED = "__unassigned__";

export default function SupportRequestModal({
  request,
  onClose,
  onStatusChange,
  teamMembers,
  onAssigneeChange,
}: SupportRequestModalProps) {
  const [status, setStatus] = useState<SupportRequestStatus>(request.status);
  const [saving, setSaving] = useState(false);
  const [assigneeId, setAssigneeId] = useState(request.assigneeId ?? UNASSIGNED);
  const [reassigning, setReassigning] = useState(false);

  async function handleStatusChange(newStatus: SupportRequestStatus) {
    setStatus(newStatus);
    setSaving(true);
    try {
      await updateSupportRequestStatusAction(request.id, newStatus);
      onStatusChange(request.id, newStatus);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssigneeChange(newAssigneeId: string) {
    setAssigneeId(newAssigneeId);
    setReassigning(true);
    try {
      const updated = await reassignSupportRequestAction(
        request.id,
        newAssigneeId === UNASSIGNED ? null : newAssigneeId
      );
      onAssigneeChange?.(request.id, updated?.assigneeId, updated?.assigneeName);
    } finally {
      setReassigning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{request.issue}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </p>
            <select
              value={status}
              disabled={saving}
              onChange={(e) =>
                handleStatusChange(e.target.value as SupportRequestStatus)
              }
              className={`mt-1 rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 ${SUPPORT_REQUEST_STATUS_COLORS[status]}`}
            >
              {SUPPORT_REQUEST_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {SUPPORT_REQUEST_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          {teamMembers && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Assigned To
              </p>
              <select
                value={assigneeId}
                disabled={reassigning}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-mint-600 focus:outline-none disabled:opacity-50"
              >
                <option value={UNASSIGNED}>Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Client
            </p>
            <p className="mt-1 text-gray-900">{request.clientName}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Website
            </p>
            <p className="mt-1 text-gray-900">{request.websiteUrl}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Submitted
            </p>
            <p className="mt-1 text-gray-900">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-gray-900">
              {request.description}
            </p>
          </div>

          {request.images.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Screenshots
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {request.images.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not a static asset
                  <img
                    key={index}
                    src={image.dataUrl}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full rounded-lg border border-gray-200 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
