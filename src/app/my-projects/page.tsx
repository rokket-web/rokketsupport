import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function MyProjectsPage() {
  const session = await getSession();

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

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          {session
            ? `Welcome back, ${session.name}.`
            : "Welcome back."}
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No projects yet. Assigned projects will show up here.
        </div>
      </main>
    </div>
  );
}
