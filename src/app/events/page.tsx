import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and recent events hosted by the Lanark Community Club.",
};

async function getEvents() {
  await connection();
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db.event.findMany({
      where: { archived: false, isPublic: true, startDate: { gte: now } },
      orderBy: { startDate: "asc" },
    }),
    db.event.findMany({
      where: { archived: false, isPublic: true, startDate: { lt: now } },
      orderBy: { startDate: "desc" },
      take: 6,
    }),
  ]);
  return { upcoming, past };
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Events</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Events</h2>
        {upcoming.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No upcoming events scheduled. Check back soon!
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-700">{formatDateTime(event.startDate)}</p>
                    {event.endDate && (
                      <p className="text-xs text-gray-400">until {formatDateTime(event.endDate)}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Past Events</h2>
          <div className="space-y-3">
            {past.map((event) => (
              <div key={event.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-700">{event.title}</h3>
                  {event.location && <p className="text-xs text-gray-400">📍 {event.location}</p>}
                </div>
                <p className="text-sm text-gray-400 shrink-0">{formatDateTime(event.startDate)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
