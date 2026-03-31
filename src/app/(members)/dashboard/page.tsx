import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDateShort, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Member Dashboard" };

async function getDashboardData() {
  await connection();
  const [recentAnnouncements, upcomingEvents, recentThreads] = await Promise.all([
    db.announcement.findMany({
      where: { archived: false },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { author: { select: { name: true } } },
    }),
    db.event.findMany({
      where: { archived: false, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
    db.thread.findMany({
      where: { archived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true } },
        _count: { select: { posts: true } },
      },
    }),
  ]);
  return { recentAnnouncements, upcomingEvents, recentThreads };
}

export default async function DashboardPage() {
  const session = await auth();
  const { recentAnnouncements, upcomingEvents, recentThreads } = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-1">
        Welcome, {session?.user?.name?.split(" ")[0] ?? "Member"}!
      </h1>
      <p className="text-gray-500 text-sm mb-8">Lanark Community Club – Member Area</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements */}
        <section className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Announcements</h2>
            <Link href="/announcements" className="text-xs text-green-700 hover:underline">View all →</Link>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-400">No announcements yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentAnnouncements.map((a) => (
                <li key={a.id}>
                  <Link href={`/announcements/${a.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                    <div className="flex items-center gap-2">
                      {a.isPinned && <span className="text-xs text-yellow-600 font-semibold">📌</span>}
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Upcoming Events</h2>
            <Link href="/calendar" className="text-xs text-green-700 hover:underline">Full calendar →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.title}</p>
                    {e.location && <p className="text-xs text-gray-400">📍 {e.location}</p>}
                  </div>
                  <p className="text-xs text-green-600 font-semibold shrink-0 ml-2">{formatDateShort(e.startDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Discussion */}
        <section className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Recent Discussions</h2>
            <Link href="/forum" className="text-xs text-green-700 hover:underline">View board →</Link>
          </div>
          {recentThreads.length === 0 ? (
            <p className="text-sm text-gray-400">No discussions yet. Start a thread!</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentThreads.map((thread) => (
                <li key={thread.id} className="py-3">
                  <Link href={`/forum/${thread.id}`} className="flex justify-between items-start hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{thread.title}</p>
                      <p className="text-xs text-gray-400">
                        by {thread.author.name} · {thread._count.posts} replies
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(thread.updatedAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
