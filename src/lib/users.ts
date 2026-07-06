export type UserRole = "admin" | "team_member";

export interface AppUser {
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
}

// Hardcoded first site admin user. Password is bcrypt-hashed below (plaintext: ddxs489Z!).
// TODO: replace with a real user store once persistence/auth is built out.
export const USERS: AppUser[] = [
  {
    username: "Admin",
    passwordHash: "$2b$10$pk6z1orPLrAVH07C9H2x1OqyOx7u.j0smRNfB5dtcf4nKg3qnBJEi",
    role: "admin",
    name: "Site Admin",
  },
];

export function findUserByUsername(username: string): AppUser | undefined {
  return USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}
