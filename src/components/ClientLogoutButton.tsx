import { clientLogoutAction } from "@/app/actions/clientAuth";

export default function ClientLogoutButton() {
  return (
    <form action={clientLogoutAction}>
      <button
        type="submit"
        className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-mint-600"
      >
        Logout
      </button>
    </form>
  );
}
