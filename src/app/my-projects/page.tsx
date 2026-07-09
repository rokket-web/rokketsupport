import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import MyAssignedRequests from "@/components/MyAssignedRequests";
import { getSession } from "@/lib/auth";
import { listSupportRequestGroupsForAssignee } from "@/lib/supportRequestStore";

// Data comes from a live database, not a static file — never prerender this
// page at build time.
export const dynamic = "force-dynamic";

export default async function MyProjectsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login/team");
  }

  const groups = await listSupportRequestGroupsForAssignee(session.id);

  return (
    <div className="min-h-screen bg-sage-50">
      <header className="flex items-center justify-between border-b border-sage-200 bg-white px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold text-gray-900">
          <span style={{ color: "#ae1d22" }}>ROKKET</span> Web Development
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
          >
            Home
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {session.name}.</p>

        <div className="mt-8">
          <MyAssignedRequests initialGroups={groups} />
        </div>
      </main>
    </div>
  );
}
