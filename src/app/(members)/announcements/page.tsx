import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Announcements" };

async function getAnnouncements() {
  await connection();
  return db.announcement.findMany({
    where: { archived: false },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  });
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Announcements</h1>

      {announcements.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="block border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:border-green-300 hover:shadow transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {a.isPinned && <span className="text-yellow-600 text-xs font-semibold">📌 Pinned</span>}
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{a.body}</p>
                </div>
                <div className="text-right shrink-0 text-xs text-gray-400">
                  <p>{formatDate(a.createdAt)}</p>
                  <p className="mt-1">{a.author.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
