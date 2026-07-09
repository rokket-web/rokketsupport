export const CLIENT_PLATFORMS = ["WordPress", "Webflow", "Next", "Other"] as const;
export type ClientPlatform = (typeof CLIENT_PLATFORMS)[number];

// Public shape sent to the browser — deliberately excludes all passwords
// (even encrypted/hashed) so they're never present in page data or client
// state. hasSftpPassword / hasPortalPassword only signal whether one is set,
// for the UI to decide whether to render a Copy/Reset button.
export interface ClientRecord {
  id: string;
  name: string;
  // Used to notify the client when a support request's status changes.
  email?: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  sftpUsername?: string;
  hasSftpPassword: boolean;
  // Separate credentials used to log into this support portal — decoupled
  // from the website admin login above so resetting one never affects the
  // other.
  portalUsername?: string;
  hasPortalPassword: boolean;
  // Team member who should automatically receive support requests submitted
  // by this client.
  defaultAssigneeId?: string;
  defaultAssigneeName?: string;
}
