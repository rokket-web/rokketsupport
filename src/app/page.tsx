import Link from "next/link";
import LoginMenu from "@/components/LoginMenu";
import LogoutButton from "@/components/LogoutButton";
import DashboardLink from "@/components/DashboardLink";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="animate-fade-in-down flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 sm:px-10"
        style={{ animationDelay: "0ms" }}
      >
        <span className="text-lg font-semibold text-gray-900">
          Rokket Web Development
        </span>
        {session ? (
          <div className="flex items-center gap-3">
            <DashboardLink role={session.role} />
            <LogoutButton />
          </div>
        ) : (
          <LoginMenu />
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1
          className="animate-fade-in-down text-3xl font-bold text-gray-900 sm:text-4xl"
          style={{ animationDelay: "300ms" }}
        >
          Rokket Web Developement Support
        </h1>
        <p
          className="animate-fade-in-down mt-4 max-w-xl text-gray-500"
          style={{ animationDelay: "600ms" }}
        >
          Your help desk for support requests, project updates, and account
          management. Log in to get started.
        </p>

        <div
          className="animate-fade-in-down mt-8 flex gap-4"
          style={{ animationDelay: "900ms" }}
        >
          <Link
            href="/login/client"
            className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Client Login
          </Link>
          <Link
            href="/login/team"
            className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Team Member Login
          </Link>
        </div>
      </main>
    </div>
  );
}
