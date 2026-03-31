import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the history and mission of the Lanark Community Club.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-6">About the Lanark Community Club</h1>

      <section className="prose prose-green max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          The Lanark Community Club (LCC) has been a cornerstone of life in Lanark, Illinois
          since its founding in 1965. Built on the belief that neighbors can accomplish more
          together than apart, the LCC has organized hundreds of events, funded local
          scholarships, and improved the physical spaces our community shares.
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          To foster community spirit, support local families, and improve Lanark through
          civic engagement, events, and charitable giving.
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">Our History</h2>
        <p className="text-gray-700 mb-4">
          Founded in 1965 by a group of civic-minded Lanark residents, the LCC began as a
          small gathering of neighbors who wanted to organize local events and raise money
          for community improvements. Over the decades, the club has grown to include
          members from all walks of life — teachers, farmers, business owners, retirees —
          united by a shared love for Lanark.
        </p>
        <p className="text-gray-700 mb-6">
          From building picnic areas to funding student scholarships, the LCC has left a
          lasting mark on our town. We are proud of what we have built and excited for what
          lies ahead.
        </p>

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">Notable Accomplishments</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>Funded and constructed new public park restrooms in City Park</li>
          <li>Built and donated a Gaga Ball pit for local youth recreation</li>
          <li>Awarded over 80 local scholarships since 1972</li>
          <li>Organized annual community events including the Summer Picnic and Fall Festival</li>
          <li>Maintained and improved community green spaces</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">Membership</h2>
        <p className="text-gray-700 mb-4">
          Membership is open to all community members in good standing. Members enjoy access
          to the private members area, where you can view the member calendar, read
          announcements, and participate in our discussion board.
        </p>
        <p className="text-gray-700 mb-6">
          New member applications are reviewed and approved by club officers. If you are
          interested in joining, please <a href="/contact" className="text-green-700 underline">contact us</a> or{" "}
          <a href="/register" className="text-green-700 underline">create an account</a>.
        </p>
      </section>
    </div>
  );
}
