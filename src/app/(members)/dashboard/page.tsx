import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { getDashboardTaskListsForUser } from "@/lib/member-hub-server";
import { formatDate, formatDateShort } from "@/lib/utils";
import type { MemberTask } from "@/lib/member-hub";

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

type ActiveEventCard = {
  id: string;
  slug: string;
  title: string;
  dateLabel: string;
  startDate: Date;
  location: string | null;
};

type DashboardEventCard = ActiveEventCard & {
  summaryLines: string[];
  openCount: number;
  coveredCount: number;
  hasLightAreas: boolean;
};

// Temporary prototype copy for Phase 1 preview when data is sparse.
const PROTOTYPE_EVENT_SUMMARIES: Record<string, string[]> = {
  "old-settlers-days": [
    "Setup - Wednesday 6:30 PM, could use a few extra hands",
    "Bar Service - mostly covered, light gaps Saturday night",
    "Parade - covered by Tim",
    "Raffle / 50-50 - needs confirmation",
  ],
};

function isThisWeek(date: Date) {
  const now = new Date();
  const weekOut = new Date(now);
  weekOut.setDate(now.getDate() + 7);
  return date >= now && date <= weekOut;
}

function pickAreaLine(tasks: MemberTask[], tone: "light" | "covered") {
  const first = tasks[0];
  if (!first) return null;

  if (tone === "light") {
    const handLine = tasks.length > 1 ? "could use a few extra hands" : "could use one more hand";
    return first.timeLabel ? `${first.areaName} - ${first.timeLabel}, ${handLine}` : `${first.areaName} - ${handLine}`;
  }

  const owners = Array.from(new Set(tasks.map((task) => task.ownerName).filter(Boolean)));
  if (owners.length === 0) return `${first.areaName} - in good shape`;
  if (owners.length === 1) return `${first.areaName} - covered by ${owners[0]}`;
  return `${first.areaName} - covered by ${owners.slice(0, 2).join(" and ")}`;
}

function groupByArea(tasks: MemberTask[]) {
  const grouped = new Map<string, MemberTask[]>();
  for (const task of tasks) {
    const existing = grouped.get(task.areaName) ?? [];
    existing.push(task);
    grouped.set(task.areaName, existing);
  }
  return grouped;
}

function buildEventCards(activeEvents: ActiveEventCard[], needsAHand: MemberTask[], whatIOwn: MemberTask[]) {
  return activeEvents.map<DashboardEventCard>((event) => {
    const openForEvent = needsAHand.filter((task) => task.eventSlug === event.slug);
    const coveredForEvent = whatIOwn.filter((task) => task.eventSlug === event.slug);
    const openByArea = groupByArea(openForEvent);
    const coveredByArea = groupByArea(coveredForEvent);

    const linesFromData: string[] = [];

    for (const tasks of openByArea.values()) {
      const line = pickAreaLine(tasks, "light");
      if (line) linesFromData.push(line);
    }

    for (const [areaName, tasks] of coveredByArea.entries()) {
      if (openByArea.has(areaName)) continue;
      const line = pickAreaLine(tasks, "covered");
      if (line) linesFromData.push(line);
    }

    const summaryLines = (PROTOTYPE_EVENT_SUMMARIES[event.slug] ?? linesFromData).slice(0, 4);
    const fallbackLines =
      summaryLines.length > 0
        ? summaryLines
        : [
            "Volunteer check-in this week.",
            "Area details and support needs are on the event page.",
          ];

    return {
      ...event,
      summaryLines: fallbackLines,
      openCount: openForEvent.length,
      coveredCount: coveredForEvent.length,
      hasLightAreas: openForEvent.length > 0 || fallbackLines.some((line) => /could use|needs/i.test(line)),
    };
  });
}

function EventSection({
  title,
  events,
  emptyMessage,
  afterEventTitle,
}: {
  title: string;
  events: DashboardEventCard[];
  emptyMessage: string;
  afterEventTitle?: string;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>

      {afterEventTitle && <p className="mt-1 text-sm text-zinc-500">Next up after this: {afterEventTitle}</p>}

      {events.length === 0 ? (
        <p className="mt-4 text-base text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/members/events/${event.slug}`} className="text-base font-semibold text-zinc-900 hover:text-emerald-700">
                    {event.title}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-emerald-700">{event.dateLabel}</p>
                  {event.location && <p className="mt-1 text-sm text-zinc-600">{event.location}</p>}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                    event.hasLightAreas
                      ? "border border-amber-200 bg-amber-50 text-amber-800"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {event.hasLightAreas ? "Light spots to fill" : "In good shape"}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {event.summaryLines.map((line) => (
                  <li key={line} className="rounded-md bg-white px-3 py-2 text-sm text-zinc-700">
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-zinc-500">{event.coveredCount} covered notes · {event.openCount} lighter areas</span>
                <Link href={`/members/events/${event.slug}`} className="font-medium text-emerald-700 hover:underline">
                  Event details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

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
    startDate: event.startDate,
    location: event.location,
  } satisfies ActiveEventCard));

  const eventCards = buildEventCards(activeEvents, needsAHand, whatIOwn);
  const thisWeekCards = eventCards.filter((event) => isThisWeek(event.startDate));
  const futureComingUpCards = eventCards.filter((event) => !isThisWeek(event.startDate));
  const nextComingUpEvent = futureComingUpCards[0] ?? null;
  const comingUpCards = nextComingUpEvent ? [nextComingUpEvent] : [];
  const afterComingUpEventTitle = futureComingUpCards[1]?.title;
  const coveredCards = eventCards.filter((event) => !event.hasLightAreas || (event.openCount === 0 && event.coveredCount > 0));

  return (
    <div className="min-h-full space-y-8 bg-stone-50">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-emerald-700">Welcome back, {firstName}!</h1>
        <p className="text-base text-zinc-600">
          A quick follow-up board after meetings: what is happening this week, what is coming up, and where we can use a hand.
        </p>
        <p className="mt-1 text-base text-zinc-500 italic">
          Keep it simple and neighborly. Event details stay on each event page.
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EventSection
          title="This Week"
          events={thisWeekCards}
          emptyMessage="Nothing urgent this week yet. Check Coming Up for the next event touchpoints."
        />
        <EventSection
          title="Coming Up"
          events={comingUpCards}
          afterEventTitle={afterComingUpEventTitle}
          emptyMessage="No upcoming event cards yet."
        />
      </div>

      <EventSection
        title="Covered / In Good Shape"
        events={coveredCards}
        emptyMessage="No fully covered event notes yet."
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-zinc-900">Club Notes</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/my-commitments" className="font-medium text-emerald-700 hover:underline">
              My Commitments →
            </Link>
            <Link href="/forum" className="font-medium text-emerald-700 hover:underline">
              Discussion →
            </Link>
            <Link href="/calendar" className="font-medium text-emerald-700 hover:underline">
              Calendar →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900">Announcements</h3>
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

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900">Discussion Check-In</h3>
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
    </div>
  );
}
