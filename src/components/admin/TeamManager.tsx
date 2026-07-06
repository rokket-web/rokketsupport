import { USERS } from "@/lib/users";

export default function TeamManager() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <button
          type="button"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add Team Member
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Username
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {USERS.map((user) => (
              <tr key={user.username}>
                <td className="px-4 py-3 text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.username}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {user.role.replace("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
