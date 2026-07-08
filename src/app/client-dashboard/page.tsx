import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/clientAuth";
import { getClientById } from "@/lib/clientStore";
import { listSupportRequestsForClient } from "@/lib/supportRequestStore";
import ClientLogoutButton from "@/components/ClientLogoutButton";
import SupportRequestSection from "@/components/client/SupportRequestSection";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await getClientSession();
  if (!session) {
    redirect("/login/client");
  }

  const client = await getClientById(session.clientId);
  if (!client) {
    redirect("/login/client");
  }

  const requests = await listSupportRequestsForClient(session.clientId);

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
          <ClientLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {client.name}.</p>

        <div className="mt-8">
          <SupportRequestSection
            clientName={client.name}
            websiteUrl={client.websiteUrl}
            initialRequests={requests}
          />
        </div>
      </main>
    </div>
  );
}
