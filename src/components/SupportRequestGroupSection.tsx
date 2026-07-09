"use client";

import { useState } from "react";
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  SUPPORT_REQUEST_STATUS_SOLID_COLORS,
  type SupportRequestGroup,
} from "@/lib/supportRequests";

interface SupportRequestGroupSectionProps {
  title: string;
  groups: SupportRequestGroup[];
  emptyMessage: string;
  loadingId: string | null;
  onOpenItem: (id: string) => void;
  showAssignee?: boolean;
}

export default function SupportRequestGroupSection({
  title,
  groups,
  emptyMessage,
  loadingId,
  onOpenItem,
  showAssignee = false,
}: SupportRequestGroupSectionProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  function toggleClient(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
                          <span className="flex items-center gap-2">
                            <span className="text-gray-800">{item.issue}</span>
                            {showAssignee && (
                              <span className="text-xs text-gray-400">
                                {item.assigneeName
                                  ? `Assigned to ${item.assigneeName}`
                                  : "Unassigned"}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {loadingId === item.id
                                ? "Loading..."
                                : new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${SUPPORT_REQUEST_STATUS_SOLID_COLORS[item.status]}`}
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
