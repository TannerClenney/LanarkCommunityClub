import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-zinc-900 sm:py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Old Settlers Days - Music in the Park
        </h1>
        <p className="mt-3 text-lg font-semibold text-zinc-700">
          Lanark, Illinois • June 26-27
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-700 sm:text-lg">
          Live music, beer garden, food, games, and 50/50 raffle
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="#schedule"
            className="rounded-lg bg-orange-500 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-orange-600"
          >
            See Schedule
          </Link>
          <Link
            href="#location"
            className="rounded-lg border border-orange-300 bg-white px-5 py-3 text-center font-semibold text-zinc-900 transition-colors hover:bg-orange-50"
          >
            Plan Your Visit
          </Link>
        </div>
      </section>

      <section id="schedule" className="mt-12 sm:mt-14">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Friday - June 26</h3>
            <ul className="mt-2 space-y-2">
              <li className="text-base text-zinc-800">
                <strong>Three on the Tree</strong> - 7PM-11PM
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Saturday - June 27</h3>
            <ul className="mt-2 space-y-2">
              <li className="text-base text-zinc-800">
                <strong>Charlie Rae</strong> - 3PM-5PM
              </li>
              <li className="text-base text-zinc-800">
                <strong>The Beaux</strong> - 7PM-11PM
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 sm:mt-14">
        <h2 className="text-2xl font-bold">What to Expect</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-zinc-800">
          <li>Beer Garden</li>
          <li>Food & Drinks</li>
          <li>Live Music</li>
          <li>Games & Activities</li>
          <li>50/50 Raffle</li>
        </ul>
      </section>

      <section id="location" className="mt-12 sm:mt-14">
        <h2 className="text-2xl font-bold">Location</h2>
        <p className="mt-4 text-base text-zinc-800">Music in the Park</p>
        <p className="text-base text-zinc-800">Lanark, Illinois</p>
      </section>

      <section className="mt-12 sm:mt-14">
        <h2 className="text-2xl font-bold">Event Flyers</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/events/old-settlers-flyer-friday.jpg"
            alt="Old Settlers Days Friday event flyer"
            className="h-auto w-full rounded-xl shadow-sm"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/events/old-settlers-flyer-saturday.jpg"
            alt="Old Settlers Days Saturday event flyer"
            className="h-auto w-full rounded-xl shadow-sm"
          />
        </div>
      </section>
    </main>
  );
}
