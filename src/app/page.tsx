import Link from "next/link";
import LoginMenu from "@/components/LoginMenu";
import LogoutButton from "@/components/LogoutButton";
import DashboardLink from "@/components/DashboardLink";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-sage-50">
      <header
        className="animate-fade-in-down flex items-center justify-between border-b border-sage-200 bg-white px-6 py-4 sm:px-10"
        style={{ animationDelay: "0ms" }}
      >
        <span className="text-lg font-semibold text-gray-900">
          <span style={{ color: "#ae1d22" }}>ROKKET</span> Web Development
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
          className="animate-fade-in-down max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          style={{ animationDelay: "300ms" }}
        >
          Rokket Web Developement Support
        </h1>
        <p
          className="animate-fade-in-down mt-5 max-w-xl text-lg text-gray-600"
          style={{ animationDelay: "600ms" }}
        >
          Your help desk for support requests, project updates, and account
          management. Log in to get started.
        </p>

        <div
          className="animate-fade-in-down mt-10 flex gap-4"
          style={{ animationDelay: "900ms" }}
        >
          <Link
            href="/login/client"
            className="rounded-full bg-gray-900 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-mint-600"
          >
            Client Login
          </Link>
          <Link
            href="/login/team"
            className="rounded-full border border-gray-300 bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 transition hover:border-gray-900"
          >
            Team Member Login
          </Link>
        </div>
      </main>
    </div>
  );
}
