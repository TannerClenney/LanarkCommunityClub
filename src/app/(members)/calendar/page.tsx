import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateShort, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Member Events" };

async function getCalendarEvents() {
  await connection();
  return db.event.findMany({
    where: { archived: false, showInMemberHub: true, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });
}

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  const activeEvents = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    location: event.location,
    dateLabel: event.endDate
      ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
      : formatDateShort(event.startDate),
    isFeatured: event.isFeatured,
    isPublic: event.isPublic,
    startDate: event.startDate,
    endDate: event.endDate,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-green-800">Events</h1>
        <p className="text-sm text-gray-600">
          Events are the main way the club stays organized. Open an event to see areas, open needs, and discussion.
        </p>
      </div>

      <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Active Events</h2>
            <p className="text-sm text-zinc-500">Start here for the work that is currently moving.</p>
          </div>
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Primary view
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <p className="text-sm text-zinc-400">No active events yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeEvents.map((event) => (
              <Link
                key={event.id}
                href={`/members/events/${event.slug}`}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  {event.isFeatured && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                  {!event.isPublic && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Members Only
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-zinc-900">{event.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{event.description}</p>
                <p className="mt-3 text-sm font-medium text-emerald-700">{event.dateLabel}</p>
                {event.location && <p className="mt-1 text-xs text-zinc-500">{event.location}</p>}
                <p className="mt-3 text-xs font-medium text-emerald-700">Open event hub →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Calendar View</h2>
            <p className="text-sm text-zinc-500">Same events, shown in date order for quick scanning.</p>
          </div>
          <span className="w-fit rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
            Secondary view
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-400">
            <p>No upcoming events scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEvents.map((event) => (
              <div
                key={`calendar-${event.id}`}
                className={`rounded-lg border bg-white p-5 shadow-sm ${
                  event.isFeatured ? "border-green-400" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{event.title}</h3>
                      {!event.isPublic && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Members Only</span>
                      )}
                      {event.isFeatured && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    {event.location && <p className="mt-2 text-sm text-gray-500">📍 {event.location}</p>}
                    <Link href={`/members/events/${event.slug}`} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
                      View event details →
                    </Link>
                  </div>
                  <div className="shrink-0 text-right">
                    {event.startDate ? (
                      <>
                        <p className="text-sm font-semibold text-green-700">{formatDateTime(event.startDate)}</p>
                        {event.endDate && <p className="text-xs text-gray-400">→ {formatDateTime(event.endDate)}</p>}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-green-700">{event.dateLabel}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
