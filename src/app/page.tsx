import Link from "next/link";

type ImageBandProps = {
  imageUrl: string;
  label?: string;
};

function ImageBand({ imageUrl, label }: ImageBandProps) {
  return (
    <section className="relative h-56 w-full overflow-hidden sm:h-64">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      {label ? (
        <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center px-4">
          <p className="text-center text-lg font-semibold tracking-wide text-white sm:text-xl">
            {label}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="w-full text-zinc-900">
      <section className="relative isolate min-h-[68vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-3xl items-center px-4 py-16 sm:py-20">
          <div className="w-full text-center">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Old Settlers Days - Music in the Park
            </h1>
            <p className="mt-5 text-lg font-semibold text-white sm:text-xl">
              June 26-27 • Lanark, Illinois
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white sm:text-lg">
              Live music, beer garden, food, games & 50/50 raffle
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="#schedule"
                className="rounded-lg bg-orange-500 px-7 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-orange-600"
              >
                See Schedule
              </Link>
              <Link
                href="#location"
                className="rounded-lg border border-white/70 bg-white px-7 py-3.5 text-center text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Plan Your Visit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
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
        </div>
      </section>

      <ImageBand
        imageUrl="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1800&q=80"
        label="Two Days of Live Music in Lanark"
      />

      <section className="bg-zinc-50 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">What to Expect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-zinc-800">
            <li>Beer Garden</li>
            <li>Food & Drinks</li>
            <li>Live Music</li>
            <li>Games & Activities</li>
            <li>50/50 Raffle</li>
          </ul>
        </div>
      </section>

      <section id="location" className="bg-zinc-50 pb-12 sm:pb-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">Location</h2>
          <p className="mt-4 text-base text-zinc-800">Music in the Park</p>
          <p className="text-base text-zinc-800">Lanark, Illinois</p>
        </div>
      </section>

      <ImageBand imageUrl="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=80" />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold">Event Lineup & Details</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/events/friday-three-on-the-tree.png"
                alt="Friday lineup flyer featuring Three on the Tree"
                className="h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/events/saturday-charlie-rae.png"
                alt="Saturday lineup flyer featuring Charlie Rae"
                className="h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-sm sm:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/events/saturday-the-beaux.png"
                alt="Saturday lineup flyer featuring The Beaux"
                className="h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
