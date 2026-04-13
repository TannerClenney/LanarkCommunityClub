import { connection } from "next/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MockTaskList } from "@/components/ui/MockTaskOwnership";
import { db } from "@/lib/db";
import { getFallbackMemberEvents, getMemberHubEvent, memberHubEvents } from "@/lib/member-hub";
import { buildMemberHubEventFromDatabase, ensureMemberHubEventData, isSeededMemberHubEventSlug } from "@/lib/member-hub-server";
import { formatDate, formatDateShort, formatDateTime } from "@/lib/utils";

const EVENT_DETAIL_IMAGE_MAP: Record<string, string> = {
  "old-settlers-days": "/images/events/OldSettlersDays.png",
  "fall-fest": "/images/events/FallFest.png",
  "haunted-house": "/images/events/HauntedHouse.png",
  "say-no-to-snow": "/images/events/SayNoToSnow5K.png",
};

function getEventDetailImage(event: { slug: string; title: string; isFeatured?: boolean }) {
  const mappedSrc = EVENT_DETAIL_IMAGE_MAP[event.slug];

  if (mappedSrc) {
    return {
      src: mappedSrc,
      alt: `${event.title} event photo`,
    };
  }

  if (event.isFeatured) {
    return {
      src: "/images/events/band-crop-2.jpg",
      alt: `${event.title} event photo`,
    };
  }

  return null;
}

async function getEventPageData(eventSlug: string) {
  await connection();

  if (isSeededMemberHubEventSlug(eventSlug)) {
    await ensureMemberHubEventData(eventSlug);
  }

  const [events, recentThreads] = await Promise.all([
    db.event.findMany({
      where: { archived: false, showInMemberHub: true },
      orderBy: { startDate: "asc" },
    }),
    db.thread.findMany({
      where: { archived: false },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        author: { select: { name: true } },
        _count: { select: { posts: { where: { archived: false } } } },
      },
    }),
  ]);

  const dbEvent = events.find((event) => event.slug === eventSlug);
  const fallbackPreview = dbEvent
    ? {
        slug: eventSlug,
        title: dbEvent.title,
        description: dbEvent.description,
        location: dbEvent.location ?? undefined,
        dateLabel: dbEvent.endDate
          ? `${formatDateShort(dbEvent.startDate)} – ${formatDateShort(dbEvent.endDate)}`
          : formatDateShort(dbEvent.startDate),
      }
    : getFallbackMemberEvents().find((event) => event.slug === eventSlug);

  const hasSeededHubData = memberHubEvents.some((event) => event.slug === eventSlug);

  if (!dbEvent && !fallbackPreview && !hasSeededHubData) {
    notFound();
  }

  const dbAreas = dbEvent
    ? await db.eventArea.findMany({
        where: { eventId: dbEvent.id },
        orderBy: { displayOrder: "asc" },
        include: {
          tasks: {
            where: { eventId: dbEvent.id },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            include: { owner: { select: { name: true } } },
          },
        },
      })
    : [];

  return {
    dbEvent,
    hubEvent:
      dbEvent && dbAreas.length > 0
        ? buildMemberHubEventFromDatabase(dbEvent, dbAreas)
        : getMemberHubEvent(eventSlug, fallbackPreview ?? undefined),
    recentThreads,
  };
}

export default async function MemberEventDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  const { eventSlug } = await params;
  const { dbEvent, hubEvent, recentThreads } = await getEventPageData(eventSlug);
  const currentUserName = session?.user?.name ?? "You";
  const detailImage = getEventDetailImage({
    slug: hubEvent.slug,
    title: hubEvent.title,
    isFeatured: dbEvent?.isFeatured,
  });

  return (
    <div className="space-y-6">
      <Link href="/calendar" className="inline-block text-sm text-green-700 hover:underline">
        ← Back to Events
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Event Hub
            </span>
            {dbEvent && !dbEvent.isPublic && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                Members Only
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-zinc-900">{hubEvent.title}</h1>
          <p className="mt-2 text-sm font-semibold text-emerald-700">{hubEvent.dateLabel}</p>
          {hubEvent.location && <p className="mt-1 text-sm text-zinc-500">📍 {hubEvent.location}</p>}

          <p className="mt-4 text-sm leading-relaxed text-zinc-700">{hubEvent.description}</p>
        </section>

        <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-44 overflow-hidden bg-stone-100">
            {detailImage ? (
              <>
                <Image src={detailImage.src} alt={detailImage.alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-lime-500" />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-100 via-lime-100 to-white/80" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                    Community Event
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/95">{hubEvent.dateLabel}</p>
                </div>
              </>
            )}
          </div>

          <div className="p-4">
            <h2 className="text-sm font-semibold text-zinc-900">At a glance</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>{hubEvent.areas.length} event areas in view</li>
              <li>{hubEvent.openNeeds.length} open needs to look at</li>
              {dbEvent ? (
                <li>Starts {formatDateTime(dbEvent.startDate)}</li>
              ) : (
                <li>Use this page as the simple work hub for the event</li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Event Areas</h2>
          <span className="text-xs text-zinc-500">Open each area to see the work list</span>
        </div>

        {hubEvent.areas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-6 text-sm text-zinc-500">
            No areas defined yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {hubEvent.areas.map((area) => (
              <Link
                key={area.slug}
                href={`/members/events/${hubEvent.slug}/areas/${area.slug}`}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-sm"
              >
                <h3 className="text-sm font-semibold text-zinc-900">{area.name}</h3>
                <p className="mt-2 text-sm text-zinc-600">{area.description}</p>
                <p className="mt-3 text-xs font-medium text-emerald-700">{area.tasks.length} tasks →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Open Needs</h2>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              Shared tasks
            </span>
          </div>

          <MockTaskList
            tasks={hubEvent.openNeeds}
            currentUserName={currentUserName}
            emptyMessage="No open needs right now."
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Discussion</h2>
            <Link href="/forum" className="text-xs text-emerald-700 hover:underline">
              Board →
            </Link>
          </div>

          {recentThreads.length > 0 ? (
            <ul className="space-y-3">
              {recentThreads.map((thread) => (
                <li key={thread.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <Link href={`/forum/${thread.id}`} className="block">
                    <p className="text-sm font-medium text-zinc-900">{thread.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {thread.author.name ?? "Member"} · {thread._count.posts} repl
                      {thread._count.posts === 1 ? "y" : "ies"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">Updated {formatDate(thread.updatedAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {hubEvent.discussion.map((item) => (
                <li key={item.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  {item.href ? (
                    <Link href={item.href} className="block">
                      <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                      <p className="mt-2 text-xs text-zinc-400">{item.updatedLabel}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                      <p className="mt-2 text-xs text-zinc-400">{item.updatedLabel}</p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
