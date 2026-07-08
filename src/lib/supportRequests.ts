export const SUPPORT_REQUEST_STATUSES = ["active", "in_progress", "complete"] as const;
export type SupportRequestStatus = (typeof SUPPORT_REQUEST_STATUSES)[number];

export const SUPPORT_REQUEST_STATUS_LABELS: Record<SupportRequestStatus, string> = {
  active: "Active",
  in_progress: "In Progress",
  complete: "Complete",
};

// Background + text pairs for a pill badge.
export const SUPPORT_REQUEST_STATUS_COLORS: Record<SupportRequestStatus, string> = {
  active: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  complete: "bg-green-100 text-green-700",
};

// Public shapes sent to the browser — summaries never include image bytes;
// full images are only fetched on demand when an admin opens an item.
export interface SupportRequestSummary {
  id: string;
  clientId: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
  status: SupportRequestStatus;
  createdAt: string;
}

export interface SupportRequestImage {
  contentType: string;
  dataUrl: string;
}

export interface SupportRequestDetails extends SupportRequestSummary {
  description: string;
  images: SupportRequestImage[];
}

export interface SupportRequestGroup {
  clientId: string;
  clientName: string;
  items: SupportRequestSummary[];
}
