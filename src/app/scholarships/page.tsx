import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Scholarship Program",
  description: "How the Lanark Community Club scholarship program supports local students through community involvement and future growth.",
};

export default function ScholarshipsPage() {

  return (
    <main className="mx-auto max-w-5xl bg-stone-50 px-4 py-12 text-zinc-800 md:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 px-6 py-12 text-white shadow-sm md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_0,_transparent_45%)]" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Community Scholarship Program</h1>
          <p className="text-base leading-7 text-white/90 md:text-lg">
            Supporting local students who give back to the community.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">What It Is</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-700 md:text-base">
            <p>
              The Lanark Community Club provides a small scholarship for local students.
            </p>
            <p>
              Community involvement is the heart of it. We value students who show up,
              help others, and contribute to local life in practical ways.
            </p>
            <p>
              This is a real part of what we do, but it is still developing and growing over time.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">How It Works</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-700 md:text-base">
            <p>
              Scholarship selection is guided by community spirit, student effort,
              and what the club can responsibly support each year.
            </p>
            <p>
              We keep this process practical rather than rigid. Details may vary from year to year
              based on participation, available funds, and local needs.
            </p>
            <p>
              Our goal is to be fair, honest, and transparent without pretending the program is more formalized than it is today.
            </p>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-7">
        <h2 className="text-2xl font-semibold tracking-tight text-emerald-800">Where We&apos;re Going</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-emerald-950 md:text-base">
          <p>
            We are working to grow the scholarship program steadily, not by overpromising,
            but by building support year after year.
          </p>
          <p>
            As fundraising grows through events and community support, we hope to strengthen
            what we can offer future students.
          </p>
          <p>
            The long-term goal is simple: keep investing in local students who invest back into Lanark.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm md:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Get Involved</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700 md:text-base">
          Attend events, support fundraising, and stay connected with the club. Every bit of participation helps us grow opportunities for local students.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            View Events
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
