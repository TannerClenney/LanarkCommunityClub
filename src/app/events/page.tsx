import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Events",
  description: "Upcoming community events hosted by the Lanark Community Club.",
};

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  image?: string;
}

const events: Event[] = [
  {
    id: "old-settlers-days",
    title: "Old Settlers Days Music and Beer Tent",
    description:
      "Join us for live music, local beer, and community celebrations at the annual Old Settlers Days.",
    date: "June 26–27, 2026",
    location: "Lanark Community Grounds",
    image: "/images/events/old-settlers-poster.jpg",
  },
  {
    id: "say-no-to-snow",
    title: "Say No To Snow 5K Race",
    description:
      "A friendly 5K race organized by the Lanark Community of Churches to promote fitness and community spirit.",
    date: "February 27, 2027",
    location: "Lanark Parks & Recreation",
  },
  {
    id: "fall-fest",
    title: "Fall Fest – Cooking and Fun",
    description:
      "Celebrate autumn with community cooking demonstrations, food tastings, and family-friendly activities.",
    date: "October 10, 2026",
    location: "Central Park Pavilion",
  },
  {
    id: "youth-basketball",
    title: "Youth Basketball Camp",
    description:
      "A fun and instructional basketball camp for community youth, organized with the Lanark Athletic Club.",
    date: "December 11, 2026",
    location: "Lanark High School Gymnasium",
  },
  {
    id: "haunted-house",
    title: "Citywide Haunted House",
    description:
      "Experience thrills and chills at the annual community haunted house, perfect for all who dare to enter.",
    date: "October 31, 2026",
    location: "Historic Downtown Building",
  },
];

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
                  📅 {event.date}
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