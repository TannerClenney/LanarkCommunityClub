export default function HomePage() {
  return (
    <main className="w-full text-zinc-900">
      <section className="relative isolate min-h-[52vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[52vh] max-w-3xl items-center px-4 py-14 sm:py-16">
          <div className="w-full text-center">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Old Settlers Days - Music in the Park
            </h1>
            <p className="mt-5 text-lg font-semibold text-white sm:text-xl">
              June 26-27 • Lanark, Illinois
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white sm:text-lg">
              Live music, beer garden, food, games, and 50/50 raffle.
            </p>
          </div>
        </div>
      </section>

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
            <div className="overflow-hidden rounded-lg shadow-sm">
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

      <section className="bg-zinc-50 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">What to Expect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-zinc-800">
            <li>Beer Garden</li>
            <li>Food & Drinks</li>
            <li>Games & Activities</li>
            <li>50/50 Raffle</li>
          </ul>
        </div>
      </section>

      <section id="location" className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold">Location</h2>
          <p className="mt-4 text-base text-zinc-800">Music in the Park</p>
          <p className="text-base text-zinc-800">Lanark, Illinois</p>
        </div>
      </section>
    </main>
  );
}
