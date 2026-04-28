import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatDateShort, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Community Event",
  description: "Learn more about upcoming public events hosted by the Lanark Community Club.",
};

const EVENT_IMAGE_MAP: Record<string, string> = {
  "old-settlers-days": "/images/events/OldSettlersDays.png",
  "fall-fest": "/images/events/FallFest.png",
  "haunted-house": "/images/events/HauntedHouse.png",
  "say-no-to-snow": "/images/events/SayNoToSnow5K.png",
};

const eventContent: Record<string, { highlights: string[] }> = {
  "old-settlers-days": {
    highlights: [
      "Live music throughout the weekend",
      "Beer tent and local vendors",
      "Family-friendly activities",
      "Community gathering in the park",
    ],
  },
  "fall-fest": {
    highlights: [
      "Local vendors and booths",
      "Seasonal food and drinks",
      "Games and activities",
      "Community fundraising efforts",
    ],
  },
  "say-no-to-snow": {
    highlights: [
      "Community 5K run and walk",
      "Winter gathering and social time",
      "Volunteer-supported event setup",
      "Local participation and support",
    ],
  },
  "haunted-house": {
    highlights: [
      "Spooky fun for all ages",
      "Seasonal treats and themed activities",
      "Community volunteers bringing the event to life",
      "A festive fall atmosphere",
    ],
  },
};

const eventLineups: Record<
  string,
  Array<{
    day: string;
    acts: Array<{
      name: string;
      time: string;
      image: string;
    }>;
  }>
> = {
  "old-settlers-days": [
    {
      day: "Friday",
      acts: [
        {
          name: "Three on the Tree",
          time: "7 PM – 11 PM",
          image: "/images/events/friday-three-on-the-tree.png",
        },
      ],
    },
    {
      day: "Saturday",
      acts: [
        {
          name: "Charlie Rae",
          time: "3 PM – 5 PM",
          image: "/images/events/saturday-charlie-rae.png",
        },
        {
          name: "The Beaux",
          time: "7 PM – 11 PM",
          image: "/images/events/saturday-the-beaux.png",
        },
      ],
    },
  ],
};

const genericHighlights = [
  "A welcoming community atmosphere",
  "Food, music, and activities to enjoy",
  "A great chance to connect with neighbors",
];

async function getPublicEvent(slug: string) {
  await connection();

  return db.event.findFirst({
    where: {
      slug,
      archived: false,
      isPublic: true,
    },
  });
}

type PublicEvent = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;

function formatEventDateRange(event: Pick<PublicEvent, "startDate" | "endDate">) {
  return event.endDate
    ? `${formatDateShort(event.startDate)} – ${formatDateShort(event.endDate)}`
    : formatDateShort(event.startDate);
}

function getEventHeroImage(event: Pick<PublicEvent, "slug" | "title" | "isFeatured">) {
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

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  const heroImage = getEventHeroImage(event);
  const dateLabel = formatEventDateRange(event);
  const highlights = eventContent[event.slug]?.highlights ?? genericHighlights;
  const lineup = eventLineups[event.slug];

  return (
    <main className="bg-stone-50 py-10 text-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <Link href="/events" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Back to Events
        </Link>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="relative h-72 overflow-hidden bg-emerald-950 md:h-96">
            {heroImage ? (
              <>
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-600" />
            )}

            <div className="relative z-10 flex h-full items-end px-6 py-6 md:px-8 md:py-8">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">Community Event</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">{event.title}</h1>
                <p className="mt-3 text-sm font-semibold text-emerald-100 md:text-base">{dateLabel}</p>
                <p className="mt-1 text-sm text-white/85 md:text-base">
                  {event.location ?? "Lanark Community Club event location"}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/90 md:text-base">{event.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-emerald-800">What to Expect</h2>
            <p className="mt-1 text-sm text-zinc-600">A quick look at what makes this event worth attending.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-sm font-medium text-zinc-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {lineup ? (
          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-emerald-800">Entertainment Lineup</h2>
              <p className="mt-1 text-sm text-zinc-600">Live music and featured acts throughout the weekend.</p>
            </div>

            <div className="space-y-6">
              {lineup.map((day) => (
                <div key={day.day}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">{day.day}</h3>
                  <div className={`grid gap-4 ${day.acts.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
                    {day.acts.map((act) => (
                      <article key={act.name} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-emerald-100 bg-stone-100">
                          <Image
                            src={act.image}
                            alt={`${act.name} poster`}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-contain object-center p-2"
                          />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-zinc-900">{act.name}</p>
                        <p className="text-sm text-zinc-600">
                          {day.day}, {act.time}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Event Details</h2>
            <dl className="mt-4 space-y-4 text-sm text-zinc-700">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</dt>
                <dd className="mt-1 font-semibold text-emerald-800">{dateLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Starts</dt>
                <dd className="mt-1">{formatDateTime(event.startDate)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Location</dt>
                <dd className="mt-1">{event.location ?? "Location to be announced"}</dd>
              </div>
              {event.endDate ? (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Ends</dt>
                  <dd className="mt-1">{formatDateTime(event.endDate)}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                <span>Live music and entertainment all weekend</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                <span>Beer tent, food, and local vendors</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                <span>A great chance to catch up with friends and neighbors</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">Want more information?</h2>
              <p className="mt-1 text-sm text-emerald-900/80">
                We are happy to answer questions and help you get connected.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
