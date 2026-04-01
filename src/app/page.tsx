import Link from "next/link";
import { connection } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import {
  type SiteEvent,
  mockEvents,
  getFeaturedEvents,
  mockFeaturedProjects,
  mockHighlights,
} from "@/lib/mock-data";

async function getHomeData() {
  if (!hasDatabase()) {
    return {
      featuredProjects: mockFeaturedProjects,
      highlights: mockHighlights,
    };
  }

  await connection();
  const [featuredProjects, highlights] = await Promise.all([
    db.project.findMany({
      where: { archived: false, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.homepageHighlight.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);
  return {
    featuredProjects,
    highlights,
  };
}

export default async function HomePage() {
  const { featuredProjects, highlights } = await getHomeData();
  const upcomingEvents: SiteEvent[] = getFeaturedEvents(mockEvents);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 bg-stone-50 text-zinc-800">
      {/* Hero */}
      <section className="bg-stone-100 border border-emerald-200 rounded-2xl px-6 py-16 md:px-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-700 mb-4">
          Welcome to the Lanark Community Club
        </h1>
        <p className="text-lg md:text-xl text-zinc-700 max-w-2xl mx-auto mb-8 leading-relaxed">
          Neighbors serving neighbors in Lanark, Illinois since 1965. Join us for events,
          community projects, and good company.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/events"
            className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            View Events
          </Link>
          <Link
            href="/donate"
            className="bg-orange-50 text-zinc-900 border border-orange-200 font-semibold px-6 py-3 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Support Our Work
          </Link>
        </div>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Community Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{h.heading}</h3>
                <p className="text-zinc-700 text-sm mb-4 leading-relaxed">{h.body}</p>
                {h.linkText && h.linkHref && (
                  <Link href={h.linkHref} className="text-emerald-700 font-semibold hover:underline text-sm">
                    {h.linkText} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-emerald-700">Upcoming Events</h2>
          <Link href="/events" className="text-emerald-700 hover:underline text-sm font-medium">
            All events →
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-zinc-600">No upcoming events right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <p className="text-xs text-emerald-700 font-semibold uppercase mb-1">
                  {event.dateLabel}
                </p>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{event.title}</h3>
                <p className="text-sm text-zinc-700 line-clamp-2 leading-relaxed">{event.description}</p>
                {event.location && <p className="text-xs text-zinc-500 mt-2">📍 {event.location}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Projects */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-emerald-700">Community Impact</h2>
          <Link href="/projects" className="text-emerald-700 hover:underline text-sm font-medium">
            All projects →
          </Link>
        </div>
        {featuredProjects.length === 0 ? (
          <p className="text-zinc-600">Check back soon for featured projects.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {project.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{project.title}</h3>
                <p className="text-sm text-zinc-700 line-clamp-3 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 text-center">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-3">Get Involved</h2>
          <p className="text-zinc-700 max-w-xl mx-auto mb-6 leading-relaxed">
            The Lanark Community Club runs on the energy of engaged neighbors. Whether you
            volunteer, donate, or attend an event - every bit helps.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/donate"
              className="bg-orange-50 text-zinc-900 border border-orange-200 font-semibold px-6 py-3 rounded-lg hover:bg-orange-100 transition-colors"
            >
              Make a Donation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
