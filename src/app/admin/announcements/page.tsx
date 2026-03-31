import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { archiveAnnouncement } from "@/app/actions/admin";
import AnnouncementFormModal from "./AnnouncementFormModal";

export const metadata: Metadata = { title: "Admin – Announcements" };

async function getAnnouncements() {
  await connection();
  return db.announcement.findMany({
    where: { archived: false },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  });
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Announcements</h1>
        <AnnouncementFormModal />
      </div>

      {announcements.length === 0 ? (
        <p className="text-gray-400">No announcements. Create one to notify members.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {a.isPinned && <span className="text-xs text-yellow-600">📌</span>}
                  <p className="font-medium text-gray-900">{a.title}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)} · {a.author.name}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.body}</p>
              </div>
              <ArchiveButton id={a.id} action={archiveAnnouncement} label="Archive" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
