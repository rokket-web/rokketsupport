import Link from "next/link";

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">
          Client Login
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Client accounts are coming soon.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500"
          >
            Sign in (coming soon)
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-gray-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
