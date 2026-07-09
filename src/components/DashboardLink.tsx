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
      className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-gray-700 transition hover:border-gray-900"
    >
      My Dashboard
    </Link>
  );
}
