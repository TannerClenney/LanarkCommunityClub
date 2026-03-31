import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Member Calendar" };

async function getCalendarEvents() {
  await connection();
  return db.event.findMany({
    where: { archived: false, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });
}

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Member Calendar</h1>

      {events.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
          <p>No upcoming events scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-5 bg-white shadow-sm ${
                event.isFeatured ? "border-green-400" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    {!event.isPublic && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Members Only</span>
                    )}
                    {event.isFeatured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-sm text-gray-500 mt-2">📍 {event.location}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-green-700">{formatDateTime(event.startDate)}</p>
                  {event.endDate && (
                    <p className="text-xs text-gray-400">→ {formatDateTime(event.endDate)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
