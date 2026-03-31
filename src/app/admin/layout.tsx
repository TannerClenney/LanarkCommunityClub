import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "OFFICER") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-52 shrink-0">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Admin</h2>
          <nav className="space-y-1">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/events", label: "Events" },
              { href: "/admin/projects", label: "Projects" },
              { href: "/admin/scholarships", label: "Scholarships" },
              { href: "/admin/gallery", label: "Gallery" },
              { href: "/admin/highlights", label: "Highlights" },
              { href: "/admin/announcements", label: "Announcements" },
              { href: "/admin/members", label: "Members" },
              { href: "/admin/contact", label: "Contact Inbox" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
