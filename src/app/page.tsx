import LoginMenu from "@/components/LoginMenu";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold text-gray-900">
          Rokket Web Development
        </span>
        {session ? <LogoutButton /> : <LoginMenu />}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Rokket Web Developement Support
        </h1>
        <p className="mt-4 max-w-xl text-gray-500">
          Your help desk for support requests, project updates, and account
          management. Log in to get started.
        </p>
      </main>
    </div>
  );
}
