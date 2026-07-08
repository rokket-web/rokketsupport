export type UserRole = "admin" | "team_member" | "developer" | "designer" | "pm";

export const USER_ROLES: UserRole[] = [
  "admin",
  "team_member",
  "developer",
  "designer",
  "pm",
];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  team_member: "Team Member",
  developer: "Developer",
  designer: "Designer",
  pm: "PM",
};
