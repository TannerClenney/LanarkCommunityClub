import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <main className="bg-stone-50 py-20">
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4">
        <section className="w-full rounded-xl bg-white p-8 text-center shadow-md">
          <h1 className="text-3xl font-bold text-green-900">Coming Soon</h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            We&apos;re building this section to better serve the Lanark community.
            Check back soon — or join us at an upcoming event!
          </p>
          <div className="mt-6">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-full bg-green-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              View Events
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}