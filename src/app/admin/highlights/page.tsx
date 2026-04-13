import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import HighlightFormModal from "./HighlightFormModal";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isBoardOrAdminRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Admin – Homepage Highlights" };

async function getHighlights() {
  await connection();
  return db.homepageHighlight.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

async function deactivateHighlight(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user || !isBoardOrAdminRole(session.user.role)) return;
  await db.homepageHighlight.update({ where: { id }, data: { active: false } });
  revalidatePath("/admin/highlights");
  revalidatePath("/");
}

export default async function AdminHighlightsPage() {
  const highlights = await getHighlights();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Homepage Highlights</h1>
        <HighlightFormModal />
      </div>
      <p className="text-sm text-gray-500 mb-6">
        These cards appear on the homepage. Keep it to 3 active highlights for best display.
      </p>

      {highlights.length === 0 ? (
        <p className="text-gray-400">No highlights active.</p>
      ) : (
        <div className="space-y-3">
          {highlights.map((h) => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{h.heading}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{h.body}</p>
                {h.linkHref && <p className="text-xs text-green-600 mt-1">{h.linkHref}</p>}
              </div>
              <form action={deactivateHighlight.bind(null, h.id)}>
                <button type="submit" className="text-xs text-red-600 hover:underline shrink-0">Deactivate</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
