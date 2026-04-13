import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateShort, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Community Events",
  description: "Upcoming community events hosted by the Lanark Community Club.",
};

async function getPublicEvents() {
  await connection();
  return db.event.findMany({
    where: { archived: false, isPublic: true },
    orderBy: { startDate: "asc" },
  });
}

type PublicEvent = Awaited<ReturnType<typeof getPublicEvents>>[number];

const EVENT_CARD_IMAGE_MAP: Record<string, string> = {
  "old-settlers-days": "/images/events/OldSettlersDays.png",
  "fall-fest": "/images/events/FallFest.png",
  "haunted-house": "/images/events/HauntedHouse.png",
  "say-no-to-snow": "/images/events/SayNoToSnow5K.png",
};

function formatEventDateRange(event: PublicEvent) {
  return event.endDate
    ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
    : formatDateShort(event.startDate);
}

function getEventCardImage(event: PublicEvent) {
  const mappedSrc = EVENT_CARD_IMAGE_MAP[event.slug];

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

function renderEventCard(event: PublicEvent, nextYearLabel = false) {
  const image = getEventCardImage(event);
  const dateLabel = formatEventDateRange(event);
  const publicHref = `/events/${event.slug}`;

  return (
    <article
      key={event.id}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden border-b border-stone-200 bg-stone-100">
        {image ? (
          <>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-200" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-lime-500" />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-100 via-lime-100 to-white/80" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                Community Event
              </p>
              <p className="mt-1 text-sm font-medium text-white/95">{dateLabel}</p>
            </div>
          </>
        )}
      </div>

      <div className="p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {nextYearLabel ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Next Year Event
            </span>
          ) : null}
          {event.isFeatured ? (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
              Featured
            </span>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{event.title}</h3>
            <p className="text-sm leading-6 text-zinc-700">{event.description}</p>
          </div>

          <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">{dateLabel}</p>
              <p className="text-xs text-zinc-500">Starts {formatDateTime(event.startDate)}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Location</p>
              <p className="mt-1 text-sm font-semibold text-zinc-800">
                {event.location ?? "Location to be announced"}
              </p>
              <p className="text-xs text-zinc-500">
                {event.isPublic ? "Open community event" : "Members only"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
          <Link
            href={publicHref}
            className="inline-flex items-center rounded-md bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            Learn More
          </Link>
          <Link href="/contact" className="text-sm font-medium text-green-700 hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const currentYear = new Date().getFullYear();
  const events = await getPublicEvents();
  const upcomingEvents = events.filter((event) => event.startDate.getFullYear() === currentYear);
  const nextYearEvents = events.filter((event) => event.startDate.getFullYear() > currentYear);

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

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 text-zinc-600">
            No events scheduled. Check back soon!
          </div>
        ) : (
          <div className="grid gap-6">
            {upcomingEvents.map((event) => renderEventCard(event))}
          </div>
        )}
      </section>

      {nextYearEvents.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Next Year</h2>

          <div className="grid gap-6">
            {nextYearEvents.map((event) => renderEventCard(event, true))}
          </div>
        </section>
      ) : null}
    </div>
  );
}