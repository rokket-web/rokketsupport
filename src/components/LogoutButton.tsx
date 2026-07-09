import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-mint-600"
      >
        Logout
      </button>
    </form>
  );
}
