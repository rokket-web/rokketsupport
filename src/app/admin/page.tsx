import Link from "next/link";
import AdminTabs from "@/components/admin/AdminTabs";
import { listClients } from "@/lib/clientStore";

export default async function AdminDashboardPage() {
  const clients = await listClients();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold text-gray-900">
          Rokket Web Development
        </span>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
          Home
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage clients and team members.
        </p>

        <div className="mt-8">
          <AdminTabs initialClients={clients} />
        </div>
      </main>
    </div>
  );
}
