import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDateShort, formatDate } from "@/lib/utils";
import { stickyTopics } from "@/lib/mock-data";

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
      where: { archived: false, pinned: false },
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

const quickLinks = [
  { label: "Forum", href: "/forum", accent: false },
  { label: "Announcements", href: "/announcements", accent: false },
  { label: "Calendar", href: "/calendar", accent: false },
  { label: "My Profile", href: "/profile", accent: false },
];

export default async function DashboardPage() {
  const session = await auth();
  const { recentAnnouncements, upcomingEvents, recentThreads } = await getDashboardData();

  return (
    <div className="bg-stone-50 min-h-full">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-1">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Member"}!
        </h1>
        <p className="text-zinc-500 text-sm">Lanark Community Club — Member Hub</p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-10">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:shadow-md hover:border-emerald-300 hover:text-emerald-700 transition-all"
          >
            {link.label}
          </Link>
        ))}

      </div>

      <div className="space-y-10">
        {/* Sticky Topics snapshot */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-700 mb-4">Club Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stickyTopics.map((topic) => (
              <Link
                key={topic.id}
                href={topic.href}
                className="group bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    {topic.title}
                  </p>
                  <span className="shrink-0 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                    Pinned
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">{topic.description}</p>
                <p className="text-xs text-zinc-400">{topic.updatedLabel}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent discussions + sidebar grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent discussions — spans 2 cols */}
          <section className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-zinc-800">Recent Discussions</h2>
              <Link href="/forum" className="text-xs text-emerald-700 hover:underline">
                View board →
              </Link>
            </div>
            {recentThreads.length === 0 ? (
              <p className="text-sm text-zinc-400">No discussions yet. Start a thread!</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentThreads.map((thread) => (
                  <li key={thread.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/forum/${thread.id}`}
                      className="flex justify-between items-start hover:bg-stone-50 -mx-2 px-2 py-1 rounded transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{thread.title}</p>
                        <p className="text-xs text-zinc-400">
                          by {thread.author.name} · {thread._count.posts} repl{thread._count.posts === 1 ? "y" : "ies"}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-400 shrink-0 ml-4">{formatDate(thread.updatedAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Right column: announcements + events stacked */}
          <div className="flex flex-col gap-6">
            {/* Announcements */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-zinc-800">Announcements</h2>
                <Link href="/announcements" className="text-xs text-emerald-700 hover:underline">
                  All →
                </Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-zinc-400">No announcements yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentAnnouncements.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/announcements/${a.id}`}
                        className="block hover:bg-stone-50 -mx-2 px-2 py-1 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {a.isPinned && (
                            <span className="shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 font-medium leading-none">
                              Pinned
                            </span>
                          )}
                          <p className="text-sm font-medium text-zinc-900 leading-snug">{a.title}</p>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{formatDate(a.createdAt)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Upcoming Events */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-zinc-800">Upcoming Events</h2>
                <Link href="/calendar" className="text-xs text-emerald-700 hover:underline">
                  Calendar →
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-zinc-400">No upcoming events.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingEvents.map((e) => (
                    <li key={e.id} className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 leading-snug">{e.title}</p>
                        {e.location && (
                          <p className="text-xs text-zinc-400">📍 {e.location}</p>
                        )}
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold shrink-0">
                        {formatDateShort(e.startDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
