export default function ClientManager() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <button
          type="button"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add Client
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
        No clients yet. Client accounts will appear here.
      </div>
    </div>
  );
}
