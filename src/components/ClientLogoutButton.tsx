import { clientLogoutAction } from "@/app/actions/clientAuth";

export default function ClientLogoutButton() {
  return (
    <form action={clientLogoutAction}>
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        Logout
      </button>
    </form>
  );
}
