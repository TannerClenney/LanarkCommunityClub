import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import MemberRoleSelect from "./MemberRoleSelect";

export const metadata: Metadata = { title: "Admin – Members" };

async function getMembers() {
  return db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export default async function AdminMembersPage() {
  const members = await getMembers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Members</h1>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Joined</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{member.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{member.email}</td>
                <td className="px-4 py-3 text-gray-400">{formatDate(member.createdAt)}</td>
                <td className="px-4 py-3">
                  <MemberRoleSelect userId={member.id} currentRole={member.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
