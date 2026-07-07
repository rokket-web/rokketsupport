export const CLIENT_PLATFORMS = ["WordPress", "Webflow", "Next", "Other"] as const;
export type ClientPlatform = (typeof CLIENT_PLATFORMS)[number];

// Public shape sent to the browser — deliberately excludes both passwords
// (even encrypted) so they're never present in page data or client state.
// hasSftpPassword only signals whether one is set, for the UI to decide
// whether to render a Copy button.
export interface ClientRecord {
  id: string;
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
  sftpUsername?: string;
  hasSftpPassword: boolean;
}
