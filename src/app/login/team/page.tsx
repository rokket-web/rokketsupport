"use client";

import { useActionState } from "react";
import Link from "next/link";
import { teamLoginAction, type TeamLoginState } from "./actions";

const initialState: TeamLoginState = {};

export default function TeamMemberLoginPage() {
  const [state, formAction, pending] = useActionState(
    teamLoginAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">
          Team Member Login
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Sign in with your Rokket Web Development account.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-mint-600 focus:outline-none"
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
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-mint-600 focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-mint-600 disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign in"}
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
