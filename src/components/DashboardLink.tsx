import Link from "next/link";
import type { UserRole } from "@/lib/users";

interface DashboardLinkProps {
  role: UserRole;
}

export default function DashboardLink({ role }: DashboardLinkProps) {
  const href = role === "admin" ? "/admin" : "/my-projects";

  return (
    <Link
      href={href}
      className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      My Dashboard
    </Link>
  );
}
