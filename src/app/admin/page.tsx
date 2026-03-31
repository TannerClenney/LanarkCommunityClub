import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Overview" };

async function getStats() {
  await connection();
  const [events, projects, scholarships, announcements, members, threads, contacts] = await Promise.all([
    db.event.count({ where: { archived: false } }),
    db.project.count({ where: { archived: false } }),
    db.scholarship.count({ where: { archived: false } }),
    db.announcement.count({ where: { archived: false } }),
    db.user.count({ where: { role: "MEMBER" } }),
    db.thread.count({ where: { archived: false } }),
    db.contactSubmission.count({ where: { read: false } }),
  ]);
  return { events, projects, scholarships, announcements, members, threads, contacts };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Events", count: stats.events, href: "/admin/events" },
    { label: "Projects", count: stats.projects, href: "/admin/projects" },
    { label: "Scholarships", count: stats.scholarships, href: "/admin/scholarships" },
    { label: "Announcements", count: stats.announcements, href: "/admin/announcements" },
    { label: "Active Members", count: stats.members, href: "/admin/members" },
    { label: "Unread Messages", count: stats.contacts, href: "/admin/contact", highlight: stats.contacts > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Admin Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`border rounded-lg p-4 text-center bg-white shadow-sm hover:shadow transition-shadow ${
              card.highlight ? "border-red-300 bg-red-50" : "border-gray-200"
            }`}
          >
            <p className={`text-3xl font-bold ${card.highlight ? "text-red-600" : "text-green-700"}`}>
              {card.count}
            </p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <strong>Quick tips:</strong> Use the sidebar to manage content. Changes take effect immediately.
        Archived items are hidden but not deleted. Members with PENDING status need approval.
      </div>
    </div>
  );
}
