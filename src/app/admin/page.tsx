import Link from "next/link";
import AdminTabs from "@/components/admin/AdminTabs";
import LogoutButton from "@/components/LogoutButton";
import { listClients } from "@/lib/clientStore";
import { listTeamMembers } from "@/lib/userStore";
import { listOpenSupportRequestGroups } from "@/lib/supportRequestStore";

// Data comes from a live database, not a static file — never prerender this
// page at build time (which would either fail without a reachable DB or bake
// in a stale snapshot).
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [clients, teamMembers, supportRequestGroups] = await Promise.all([
    listClients(),
    listTeamMembers(),
    listOpenSupportRequestGroups(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold text-gray-900">
          Rokket Web Development
        </span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            Home
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage clients and team members.
        </p>

        <div className="mt-8">
          <AdminTabs
            initialClients={clients}
            initialTeamMembers={teamMembers}
            initialSupportRequestGroups={supportRequestGroups}
          />
        </div>
      </main>
    </div>
  );
}
