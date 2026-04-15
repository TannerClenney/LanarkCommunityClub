import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { DashboardTaskOwnershipBoard } from "@/components/ui/MockTaskOwnership";
import { getDashboardTaskListsForUser } from "@/lib/member-hub-server";
import { formatDate, formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Member Dashboard" };

async function getDashboardData(userId?: string, memberName?: string | null) {
  await connection();
  const [recentAnnouncements, upcomingEvents, recentThreads, taskLists] = await Promise.all([
    db.announcement.findMany({
      where: { archived: false },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { author: { select: { name: true } } },
    }),
    db.event.findMany({
      where: { archived: false, showInMemberHub: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 4,
    }),
    db.thread.findMany({
      where: { archived: false, pinned: false },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        author: { select: { name: true } },
        _count: { select: { posts: { where: { archived: false } } } },
      },
    }),
    userId ? getDashboardTaskListsForUser(userId, memberName) : Promise.resolve({ needsAHand: [], whatIOwn: [] }),
  ]);

  return { recentAnnouncements, upcomingEvents, recentThreads, ...taskLists };
}

const quickLinks = [
  { label: "Events", href: "/calendar" },
  { label: "My Commitments", href: "/my-commitments" },
  { label: "Announcements", href: "/announcements" },
  { label: "Discussion", href: "/forum" },
  { label: "My Profile", href: "/profile" },
];

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Member";
  const { recentAnnouncements, upcomingEvents, recentThreads, needsAHand, whatIOwn } = await getDashboardData(
    session?.user?.id,
    firstName,
  );

  const activeEvents = upcomingEvents.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    dateLabel: event.endDate
      ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
      : formatDateShort(event.startDate),
    location: event.location,
  }));

  return (
    <div className="min-h-full space-y-8 bg-stone-50">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-emerald-700">Welcome back, {firstName}!</h1>
        <p className="text-base text-zinc-600">
          Start with what matters now, then jump into the event work that needs attention.
        </p>
        <p className="mt-1 text-base text-zinc-500 italic">
          Everything you do here helps make these events happen.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base font-medium text-zinc-800 shadow-sm transition-all hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardTaskOwnershipBoard
          currentUserName={session?.user?.name ?? firstName}
          currentUserId={session?.user?.id}
          needsAHand={needsAHand}
          whatIOwn={whatIOwn}
        />

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">What&apos;s Coming Up</h2>
            <Link href="/calendar" className="text-sm font-medium text-emerald-700 hover:underline">
              View all →
            </Link>
          </div>

          {activeEvents.length === 0 ? (
            <p className="text-base text-zinc-500">No upcoming events yet.</p>
          ) : (
            <ul className="space-y-4">
              {activeEvents.map((event) => (
                <li key={event.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <Link href={`/members/events/${event.slug}`} className="block">
                    <p className="text-base font-semibold text-zinc-900 hover:text-emerald-700">{event.title}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-700">{event.dateLabel}</p>
                    {event.location && <p className="mt-1 text-sm text-zinc-600">{event.location}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Announcements</h2>
            <Link href="/announcements" className="text-sm font-medium text-emerald-700 hover:underline">
              All →
            </Link>
          </div>

          {recentAnnouncements.length === 0 ? (
            <p className="text-base text-zinc-500">No announcements yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <li key={announcement.id}>
                  <Link
                    href={`/announcements/${announcement.id}`}
                    className="block rounded-lg border border-stone-200 bg-stone-50 p-4 transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      {announcement.isPinned && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-medium text-amber-800">
                          Pinned
                        </span>
                      )}
                      <p className="text-base font-semibold text-zinc-900">{announcement.title}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{announcement.body}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(announcement.createdAt)} · {announcement.author.name ?? "Club"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Recent Discussion</h2>
            <Link href="/forum" className="text-sm font-medium text-emerald-700 hover:underline">
              Board →
            </Link>
          </div>

          {recentThreads.length === 0 ? (
            <p className="text-base text-zinc-500">No discussion yet. Start a thread when needed.</p>
          ) : (
            <ul className="space-y-4">
              {recentThreads.map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/forum/${thread.id}`}
                    className="block rounded-lg border border-stone-200 bg-stone-50 p-4 transition-colors hover:bg-white"
                  >
                    <p className="text-base font-semibold text-zinc-900">{thread.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {thread.author.name ?? "Member"} · {thread._count.posts} repl
                      {thread._count.posts === 1 ? "y" : "ies"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">Updated {formatDate(thread.updatedAt)}</p>
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
