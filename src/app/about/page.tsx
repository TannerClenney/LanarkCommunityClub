import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how the Lanark Community Club supports local events, projects, and community connection.",
};

const whatWeDo = [
  {
    title: "Community Events",
    body: "We help organize familiar local traditions, seasonal gatherings, and fundraiser events that bring neighbors together.",
  },
  {
    title: "Local Support",
    body: "We pitch in where the community needs a hand and support projects that make Lanark more active, welcoming, and cared for.",
  },
  {
    title: "Student Scholarships",
    body: "We invest back into local students and encourage the kind of community involvement that keeps small towns strong.",
  },
  {
    title: "Neighbor Connection",
    body: "We create simple ways for people to meet, volunteer, contribute, and stay connected to the life of the town.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl bg-stone-50 px-4 py-12 text-zinc-800 md:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 px-6 py-14 text-white shadow-sm md:px-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_0,_transparent_45%)]" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
            Lanark Community Club
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Neighbors working together to keep Lanark active, connected, and welcoming.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              The Lanark Community Club is a practical group of local people who care about this town,
              support its events, and help turn volunteer effort into real community value.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">What We Do</h2>
          <p className="text-sm leading-6 text-zinc-600 md:text-base">
            Our work stays simple and community-centered: create good events, support local needs,
            and keep people involved in the life of Lanark.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {whatWeDo.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-700 md:text-base">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-700">Why It Matters</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-700 md:text-base">
            <p>
              Small towns run on participation. A lot of what people enjoy in Lanark only happens because
              someone is willing to organize, volunteer, donate time, or quietly help things come together.
            </p>
            <p>
              The club helps keep that spirit moving by turning local effort into visible results — stronger
              events, community support, scholarships, and a better sense of connection between neighbors.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-800">Looking Ahead</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-emerald-950 md:text-base">
            <p>
              We want to keep improving the events people already care about while making it easier for more
              members to take part in meaningful, manageable ways.
            </p>
            <p>
              We are also continuing to capture the club&apos;s history and community impact so the story of this
              work is not lost over time.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 shadow-sm md:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Get Involved</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-700 md:text-base">
              Come to an event, reach out with an idea, or ask how you can help. Whether you have a little
              time or a lot, there is room to contribute in a way that fits real life.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Contact Us
              </Link>
              <Link href="/events" className="text-sm font-medium text-emerald-700 hover:underline">
                View community events →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm md:p-7">
          <h3 className="text-lg font-semibold text-zinc-900">Help Us Tell Our Story</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-700 md:text-base">
            If you have photos, memories, or bits of club history to share, we would love to hear from you.
            Those contributions help us document the real impact the Lanark Community Club has had over time.
          </p>
        </div>
      </section>
    </div>
  );
}
