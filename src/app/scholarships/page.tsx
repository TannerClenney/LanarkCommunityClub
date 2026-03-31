import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Scholarships",
  description: "The Lanark Community Club scholarship program for local students.",
};

async function getScholarships() {
  return db.scholarship.findMany({
    where: { archived: false },
    orderBy: { year: "desc" },
  });
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships();
  const byYear = scholarships.reduce<Record<number, typeof scholarships>>((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Scholarships</h1>
      <p className="text-gray-600 mb-8">
        Since 1972, the Lanark Community Club has awarded scholarships to outstanding local
        students pursuing higher education. We are proud to invest in the next generation
        of Lanark&apos;s community leaders.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="font-bold text-green-800 text-lg mb-2">About Our Scholarship Program</h2>
        <p className="text-gray-700 text-sm">
          Scholarships are awarded each spring to graduating seniors from the local area. 
          Recipients are selected based on academic achievement, community involvement,
          and financial need. Award amounts vary by year depending on available funds.
        </p>
      </div>

      {years.length === 0 ? (
        <p className="text-gray-500">Scholarship history coming soon.</p>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                {year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {byYear[year].map((s) => (
                  <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="font-semibold text-gray-900">{s.recipientName}</p>
                    {s.amount && (
                      <p className="text-sm text-green-700 font-medium">
                        ${s.amount.toLocaleString()}
                      </p>
                    )}
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
