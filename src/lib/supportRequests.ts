// Public shapes sent to the browser — summaries never include image bytes;
// full images are only fetched on demand when an admin opens an item.
export interface SupportRequestSummary {
  id: string;
  clientId: string;
  clientName: string;
  websiteUrl: string;
  issue: string;
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
