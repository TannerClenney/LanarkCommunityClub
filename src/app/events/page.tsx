import type { Metadata } from "next";
import { type SiteEvent, mockEvents, sortEventsByMonth } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Community Events",
  description: "Upcoming community events hosted by the Lanark Community Club.",
};

const events: SiteEvent[] = sortEventsByMonth(mockEvents);

export default function EventsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-green-800 mb-2">Community Events</h1>
      <p className="text-gray-600 mb-8">
        Discover and join the vibrant events that bring our community together.
      </p>

      <div className="grid gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
          >
            {event.image && (
              <div className="w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.title}
              </h2>

              <p className="text-gray-700 text-sm mb-4">{event.description}</p>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-700">
                  📅 {event.dateLabel}
                </p>

                {event.location && (
                  <p className="text-gray-600 text-sm">
                    📍 {event.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">
          No events scheduled. Check back soon!
        </div>
      )}
    </div>
  );
}