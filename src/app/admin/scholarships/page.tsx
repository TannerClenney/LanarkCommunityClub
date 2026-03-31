import type { Metadata } from "next";
import { db } from "@/lib/db";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { archiveScholarship } from "@/app/actions/admin";
import ScholarshipFormModal from "./ScholarshipFormModal";

export const metadata: Metadata = { title: "Admin – Scholarships" };

async function getScholarships() {
  return db.scholarship.findMany({
    where: { archived: false },
    orderBy: { year: "desc" },
  });
}

export default async function AdminScholarshipsPage() {
  const scholarships = await getScholarships();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Scholarships</h1>
        <ScholarshipFormModal />
      </div>

      {scholarships.length === 0 ? (
        <p className="text-gray-400">No scholarships yet.</p>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{s.recipientName}</p>
                <p className="text-xs text-gray-400">{s.year}{s.amount ? ` · $${s.amount.toLocaleString()}` : ""}</p>
              </div>
              <ArchiveButton id={s.id} action={archiveScholarship} label="Archive" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
