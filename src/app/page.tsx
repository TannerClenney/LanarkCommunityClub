import Link from "next/link";
import { connection } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import {
  mockEvents,
  getFeaturedEvents,
  mockFeaturedProjects,
  mockHighlights,
} from "@/lib/mock-data";

async function getHomeData() {
  if (!hasDatabase()) {
    return {
      upcomingEvents: getFeaturedEvents(mockEvents),
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
    upcomingEvents: getFeaturedEvents(mockEvents),
    featuredProjects,
    highlights,
  };
}

export default async function HomePage() {
  const { upcomingEvents, featuredProjects, highlights } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-green-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to the Lanark Community Club
        </h1>
        <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
          Neighbors serving neighbors in Lanark, Illinois since 1965. Join us for events,
          community projects, and good company.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/events"
            className="bg-white text-green-800 font-bold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            View Events
          </Link>
          <Link
            href="/donate"
            className="bg-yellow-500 text-green-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Support Our Work
          </Link>
        </div>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => (
              <div key={h.id} className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-green-800 text-lg mb-2">{h.heading}</h3>
                <p className="text-gray-700 text-sm mb-4">{h.body}</p>
                {h.linkText && h.linkHref && (
                  <Link href={h.linkHref} className="text-green-700 font-semibold hover:underline text-sm">
                    {h.linkText} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
            <Link href="/events" className="text-green-700 hover:underline text-sm font-medium">
              All events →
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events right now. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                    {event.dateLabel}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-2">📍 {event.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Community Impact</h2>
          <Link href="/projects" className="text-green-700 hover:underline text-sm font-medium">
            All projects →
          </Link>
        </div>
        {featuredProjects.length === 0 ? (
          <p className="text-gray-500">Check back soon for featured projects.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {project.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-green-700 text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Get Involved</h2>
        <p className="text-green-100 max-w-xl mx-auto mb-6">
          The Lanark Community Club runs on the energy of engaged neighbors. Whether you
          volunteer, donate, or attend an event — every bit helps.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/contact" className="bg-white text-green-800 font-bold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors">
            Contact Us
          </Link>
          <Link href="/donate" className="bg-yellow-400 text-green-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors">
            Make a Donation
          </Link>
        </div>
      </section>
    </div>
  );
}
