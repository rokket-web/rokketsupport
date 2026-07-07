export const CLIENT_PLATFORMS = ["WordPress", "Webflow", "Next", "Other"] as const;
export type ClientPlatform = (typeof CLIENT_PLATFORMS)[number];

// Public shape sent to the browser — deliberately excludes the password
// (even encrypted) so it's never present in page data or client state.
export interface ClientRecord {
  id: string;
  name: string;
  websiteUrl: string;
  loginUrl: string;
  platform: ClientPlatform;
  customPlatform?: string;
  adminUsername: string;
}
