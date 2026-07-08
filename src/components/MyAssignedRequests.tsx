"use client";

import { useState } from "react";
import { getSupportRequestDetailsAction } from "@/app/actions/support";
import SupportRequestGroupSection from "@/components/SupportRequestGroupSection";
import SupportRequestModal from "@/components/SupportRequestModal";
import { addGroupItem, removeGroupItem } from "@/lib/supportRequestGroups";
import type {
  SupportRequestDetails,
  SupportRequestGroup,
  SupportRequestGroups,
  SupportRequestStatus,
  SupportRequestSummary,
} from "@/lib/supportRequests";

interface MyAssignedRequestsProps {
  initialGroups: SupportRequestGroups;
}

export default function MyAssignedRequests({ initialGroups }: MyAssignedRequestsProps) {
  const [activeGroups, setActiveGroups] = useState<SupportRequestGroup[]>(
    initialGroups.active
  );
  const [completedGroups, setCompletedGroups] = useState<SupportRequestGroup[]>(
    initialGroups.completed
  );
  const [selectedRequest, setSelectedRequest] = useState<SupportRequestDetails | null>(
    null
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

    const fromActive = removeGroupItem(activeGroups, id);
    const fromCompleted = removeGroupItem(completedGroups, id);
    const original = fromActive.item ?? fromCompleted.item;
    if (!original) return;

    const updated: SupportRequestSummary = { ...original, status };

    if (status === "complete") {
      setActiveGroups(fromActive.groups);
      setCompletedGroups(addGroupItem(fromCompleted.groups, updated));
    } else {
      setCompletedGroups(fromCompleted.groups);
      setActiveGroups(addGroupItem(fromActive.groups, updated));
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <SupportRequestGroupSection
        title="Active Support Items"
        groups={activeGroups}
        emptyMessage="No active support requests assigned to you."
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
