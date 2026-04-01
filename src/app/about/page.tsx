import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how the Lanark Community Club supports local events, projects, and community connection.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 bg-stone-50 text-zinc-800">
      <section className="bg-stone-100 border border-emerald-200 rounded-2xl px-6 py-16 md:px-10">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-700">About the Lanark Community Club</h1>
        <p className="text-lg text-zinc-700 mt-4 max-w-3xl leading-relaxed">
          The Lanark Community Club is a group of local members who work together to support,
          improve, and enjoy our community. We are neighbors who care about this town and want
          to keep it active, connected, and welcoming.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-5">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Community Events</h3>
            <p className="text-zinc-700 leading-relaxed">
              Host events like Old Settlers Days, fundraisers, and seasonal activities.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Local Support</h3>
            <p className="text-zinc-700 leading-relaxed">
              Support local initiatives and partner organizations that serve Lanark.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Student Scholarships</h3>
            <p className="text-zinc-700 leading-relaxed">
              Provide scholarships to students who show strong community involvement.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Neighbor Connection</h3>
            <p className="text-zinc-700 leading-relaxed">
              Create opportunities for neighbors to connect, volunteer, and get involved.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Why It Matters</h2>
        <p className="text-zinc-700 max-w-2xl leading-relaxed">
          Small towns run on participation. The Lanark Community Club helps keep that spirit
          going through contribution, collaboration, and local pride.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Looking Ahead</h2>
        <div className="max-w-2xl space-y-4">
          <p className="text-zinc-700 leading-relaxed">
            The future of the club is shaped by its members. We are continuing to grow,
            improve events, and explore new ways to serve the community.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            We are also working to better capture and share the history and impact of the
            Lanark Community Club over time.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Get Involved</h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-2xl">
            Attend a meeting, come to an event, or reach out to learn how you can help.
            Whether you have a little time or a lot, there is a place for you to contribute.
          </p>
          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <section className="mt-12">
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-7">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Help Us Tell Our Story</h3>
          <p className="text-zinc-700 leading-relaxed text-sm md:text-base">
            Have photos, stories, or club history to share? We welcome member contributions
            as we continue improving this page and documenting the club&apos;s community impact.
          </p>
        </div>
      </section>
    </div>
  );
}
