"use client";

import { useState } from "react";
import { getSupportRequestDetailsAction } from "@/app/actions/support";
import SupportRequestModal from "./SupportRequestModal";
import type {
  SupportRequestDetails,
  SupportRequestGroup,
} from "@/lib/supportRequests";

interface SupportRequestManagerProps {
  initialGroups: SupportRequestGroup[];
}

export default function SupportRequestManager({
  initialGroups,
}: SupportRequestManagerProps) {
  const [groups] = useState<SupportRequestGroup[]>(initialGroups);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<SupportRequestDetails | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function toggleClient(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
  }

  async function openItem(id: string) {
    setLoadingId(id);
    try {
      const details = await getSupportRequestDetailsAction(id);
      setSelectedRequest(details);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Support Requests</h2>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No open support requests.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                      ({group.items.length} open)
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
                          onClick={() => openItem(item.id)}
                          disabled={loadingId === item.id}
                          className="flex w-full items-center justify-between px-8 py-2.5 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                        >
                          <span className="text-gray-800">{item.issue}</span>
                          <span className="text-xs text-gray-400">
                            {loadingId === item.id
                              ? "Loading..."
                              : new Date(item.createdAt).toLocaleDateString()}
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

      {selectedRequest && (
        <SupportRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
