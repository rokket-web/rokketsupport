"use client";

import { useEffect, useState } from "react";
import { getSupportRequestDetailsAction } from "@/app/actions/support";
import SupportRequestModal from "./SupportRequestModal";
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  SUPPORT_REQUEST_STATUS_SOLID_COLORS,
  type SupportRequestDetails,
  type SupportRequestGroup,
  type SupportRequestGroups,
  type SupportRequestStatus,
  type SupportRequestSummary,
} from "@/lib/supportRequests";

interface SupportRequestManagerProps {
  initialGroups: SupportRequestGroups;
  onActiveCountChange?: (count: number) => void;
}

interface RemoveResult {
  groups: SupportRequestGroup[];
  item: SupportRequestSummary | null;
}

function removeItem(groups: SupportRequestGroup[], id: string): RemoveResult {
  let item: SupportRequestSummary | null = null;
  const next = groups
    .map((group) => {
      const found = group.items.find((i) => i.id === id);
      if (found) item = found;
      return { ...group, items: group.items.filter((i) => i.id !== id) };
    })
    .filter((group) => group.items.length > 0);
  return { groups: next, item };
}

function addItem(
  groups: SupportRequestGroup[],
  item: SupportRequestSummary
): SupportRequestGroup[] {
  const existingIndex = groups.findIndex((g) => g.clientId === item.clientId);
  if (existingIndex === -1) {
    return [...groups, { clientId: item.clientId, clientName: item.clientName, items: [item] }];
  }
  return groups.map((g, idx) =>
    idx === existingIndex ? { ...g, items: [item, ...g.items] } : g
  );
}

interface SupportRequestGroupSectionProps {
  title: string;
  groups: SupportRequestGroup[];
  emptyMessage: string;
  loadingId: string | null;
  onOpenItem: (id: string) => void;
}

function SupportRequestGroupSection({
  title,
  groups,
  emptyMessage,
  loadingId,
  onOpenItem,
}: SupportRequestGroupSectionProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  function toggleClient(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {groups.map((group) => {
            const isExpanded = expandedClientId === group.clientId;
            return (
              <li key={group.clientId}>
                <button
                  type="button"
                  onClick={() => toggleClient(group.clientId)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">
                    {group.clientName}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      ({group.items.length})
                    </span>
                  </span>
                  <span
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ›
                  </span>
                </button>

                {isExpanded && (
                  <ul className="divide-y divide-gray-100 border-t border-gray-100 bg-gray-50">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onOpenItem(item.id)}
                          disabled={loadingId === item.id}
                          className="flex w-full items-center justify-between px-8 py-2.5 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                        >
                          <span className="text-gray-800">{item.issue}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {loadingId === item.id
                                ? "Loading..."
                                : new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${SUPPORT_REQUEST_STATUS_SOLID_COLORS[item.status]}`}
                            >
                              {SUPPORT_REQUEST_STATUS_LABELS[item.status]}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SupportRequestManager({
  initialGroups,
  onActiveCountChange,
}: SupportRequestManagerProps) {
  const [activeGroups, setActiveGroups] = useState<SupportRequestGroup[]>(
    initialGroups.active
  );
  const [completedGroups, setCompletedGroups] = useState<SupportRequestGroup[]>(
    initialGroups.completed
  );
  const [selectedRequest, setSelectedRequest] =
    useState<SupportRequestDetails | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const count = activeGroups.reduce((sum, group) => sum + group.items.length, 0);
    onActiveCountChange?.(count);
    // onActiveCountChange intentionally omitted — only re-run when the counts themselves change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroups]);

  async function openItem(id: string) {
    setLoadingId(id);
    try {
      const details = await getSupportRequestDetailsAction(id);
      setSelectedRequest(details);
    } finally {
      setLoadingId(null);
    }
  }

  function handleStatusChange(id: string, status: SupportRequestStatus) {
    setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, status } : prev));

    const fromActive = removeItem(activeGroups, id);
    const fromCompleted = removeItem(completedGroups, id);
    const original = fromActive.item ?? fromCompleted.item;
    if (!original) return;

    const updated: SupportRequestSummary = { ...original, status };

    if (status === "complete") {
      setActiveGroups(fromActive.groups);
      setCompletedGroups(addItem(fromCompleted.groups, updated));
    } else {
      setCompletedGroups(fromCompleted.groups);
      setActiveGroups(addItem(fromActive.groups, updated));
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <SupportRequestGroupSection
        title="Active Support Items"
        groups={activeGroups}
        emptyMessage="No active support requests."
        loadingId={loadingId}
        onOpenItem={openItem}
      />

      <SupportRequestGroupSection
        title="Completed Support Items"
        groups={completedGroups}
        emptyMessage="No completed support requests yet."
        loadingId={loadingId}
        onOpenItem={openItem}
      />

      {selectedRequest && (
        <SupportRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
