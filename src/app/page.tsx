import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateShort } from "@/lib/utils";

const EVENT_IMAGE_MAP: Record<string, string> = {
  "old-settlers-days": "/images/events/OldSettlersDays.png",
  "fall-fest": "/images/events/FallFest.png",
  "haunted-house": "/images/events/HauntedHouse.png",
  "say-no-to-snow": "/images/events/SayNoToSnow5K.png",
};

const whatWeDo = [
  {
    title: "Community Events",
    body: "We organize local traditions and seasonal gatherings that bring neighbors together.",
  },
  {
    title: "Local Support",
    body: "We help with practical projects that keep Lanark active, welcoming, and cared for.",
  },
  {
    title: "Student Scholarships",
    body: "We invest in local students and encourage long-term community involvement.",
  },
  {
    title: "Neighbor Connection",
    body: "We make it easier for people to volunteer, contribute, and stay connected.",
  },
];

async function getPublicEvents() {
  await connection();

  return db.event.findMany({
    where: {
      archived: false,
      isPublic: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });
}

type PublicEvent = Awaited<ReturnType<typeof getPublicEvents>>[number];

function formatEventDateRange(event: Pick<PublicEvent, "startDate" | "endDate">) {
  return event.endDate
    ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
    : formatDateShort(event.startDate);
}

function getEventImage(event: Pick<PublicEvent, "slug" | "title" | "isFeatured">) {
  const mappedSrc = EVENT_IMAGE_MAP[event.slug];

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

export default async function HomePage() {
  const today = new Date();
  const events = await getPublicEvents();
  const upcomingEvents = events.filter((event) => event.startDate >= today);
  const fallbackOsd = events.find((event) => event.slug === "old-settlers-days");

  const featuredEvent =
    upcomingEvents.find((event) => event.isFeatured) ??
    upcomingEvents[0] ??
    fallbackOsd ??
    events[0] ??
    null;

  const eventPreviews = upcomingEvents
    .filter((event) => event.slug !== featuredEvent?.slug)
    .slice(0, 3);

  const featuredImage = featuredEvent ? getEventImage(featuredEvent) : null;

  return (
    <main className="w-full bg-stone-50 text-zinc-900">
      <section className="relative isolate overflow-hidden border-b border-stone-200 bg-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_0,_transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              Lanark Community Club
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Community events, local support, and neighbors working together.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              We help bring Lanark together through events, volunteer effort, and practical community projects that make a visible difference.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
              >
                View Upcoming Events
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Get Involved
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredEvent ? (
        <section className="mx-auto mt-12 max-w-5xl px-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">Featured Event</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Upcoming Highlight
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative h-56 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 md:h-72">
                {featuredImage ? (
                  <Image
                    src={featuredImage.src}
                    alt={featuredImage.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-lime-500" />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-zinc-900">{featuredEvent.title}</h3>
                <p className="mt-2 text-sm font-semibold text-emerald-700">{formatEventDateRange(featuredEvent)}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-700">{featuredEvent.description}</p>
                <div className="mt-5">
                  <Link
                    href={`/events/${featuredEvent.slug}`}
                    className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    View Event Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">Upcoming Events</h2>
            <Link href="/events" className="text-sm font-medium text-emerald-700 hover:underline">
              View All Events →
            </Link>
          </div>

          {eventPreviews.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-5 text-sm text-zinc-600">
              New events are coming soon. Check the full events page for updates.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {eventPreviews.map((event) => (
                <article key={event.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <h3 className="text-base font-semibold text-zinc-900">{event.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">{formatEventDateRange(event)}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{event.description}</p>
                  <Link href={`/events/${event.slug}`} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
                    Learn more →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <div className="mb-5 max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">What We Do</h2>
          <p className="text-sm leading-6 text-zinc-600 md:text-base">
            We keep things simple: create good events, support local needs, and help neighbors stay involved.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {whatWeDo.map((item) => (
            <article key={item.title} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4 pb-14">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-900">Get Involved</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/90 md:text-base">
            Join an event, share an idea, or ask where you can help. There is always room for neighbors who want to make a difference.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Contact Us
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
