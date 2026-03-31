import { connection } from "next/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const announcement = await db.announcement.findUnique({
    where: { id, archived: false },
    include: { author: { select: { name: true } } },
  });

  if (!announcement) notFound();

  return (
    <div>
      <Link href="/announcements" className="text-sm text-green-700 hover:underline mb-4 inline-block">
        ← Back to Announcements
      </Link>
      <article className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          {announcement.isPinned && <span className="text-xs text-yellow-600 font-semibold">📌 Pinned</span>}
          <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Posted by {announcement.author.name} on {formatDateTime(announcement.createdAt)}
        </p>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{announcement.body}</div>
      </article>
    </div>
  );
}
