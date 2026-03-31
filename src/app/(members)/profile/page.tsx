import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  await connection();
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user!.id },
    select: { id: true, name: true, email: true, bio: true, phone: true, role: true, createdAt: true },
  });

  if (!user) return <p>User not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">My Profile</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-lg">
        <div className="mb-4 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Role: </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            user.role === "ADMIN" ? "bg-red-100 text-red-700" :
            user.role === "OFFICER" ? "bg-blue-100 text-blue-700" :
            user.role === "MEMBER" ? "bg-green-100 text-green-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {user.role}
          </span>
        </div>
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
