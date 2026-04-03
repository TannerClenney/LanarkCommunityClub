import type { Metadata } from "next";
import { type SiteEvent, mockEvents, sortEventsByMonth } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Community Events",
  description: "Upcoming community events hosted by the Lanark Community Club.",
};

const sorted = sortEventsByMonth(mockEvents);
const events: SiteEvent[] = [
  ...sorted.filter((e) => e.id === "old-settlers-days"),
  ...sorted.filter((e) => e.id !== "old-settlers-days"),
];

export default function EventsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 bg-stone-50 text-zinc-800">
      <section
        className="relative overflow-hidden rounded-xl bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/images/events/band-crop-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">Community Events</h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Discover and join the vibrant events that bring our community together.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Upcoming Events</h2>

        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 text-zinc-600">
            No events scheduled. Check back soon!
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              event.id === "old-settlers-days" ? (
                <div
                  key={event.id}
                  className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden"
                >
                  <div className="w-full bg-stone-100 flex items-center justify-center p-2 rounded-t-xl" style={{minHeight: "20rem"}}>
                    <img
                      src="/images/events/band-schedule.png"
                      alt="Old Settlers Days music schedule"
                      className="max-w-full max-h-80 object-contain rounded"
                    />
                  </div>

                  <div className="p-5 md:p-6">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Old Settlers Days – Music & Beer Tent</h3>
                    <p className="text-zinc-700 leading-relaxed mb-4">
                      Two days of live music, cold drinks, and small-town summer energy.
                    </p>
                    <div className="space-y-1 text-sm font-medium text-emerald-700">
                      <p>June 26–27</p>
                      <p>Lanark Community Grounds</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {event.image && (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden rounded-lg mb-4">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{event.title}</h3>

                  <p className="text-zinc-700 text-sm mb-4 leading-relaxed">{event.description}</p>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-700">📅 {event.dateLabel}</p>

                    {event.location && (
                      <p className="text-sm font-medium text-emerald-700">📍 {event.location}</p>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </section>
    </div>
  );
}