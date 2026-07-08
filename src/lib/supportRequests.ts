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

// Solid background + white text, for the button-style status indicator in
// the Support Requests list rows.
export const SUPPORT_REQUEST_STATUS_SOLID_COLORS: Record<SupportRequestStatus, string> = {
  active: "bg-red-600 text-white",
  in_progress: "bg-yellow-500 text-white",
  complete: "bg-green-600 text-white",
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
  assigneeId?: string;
  assigneeName?: string;
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

export interface SupportRequestGroups {
  active: SupportRequestGroup[];
  completed: SupportRequestGroup[];
}
