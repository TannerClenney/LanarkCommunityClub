import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PENDING") redirect("/pending-approval");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0">
          <nav className="space-y-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/calendar", label: "Calendar" },
              { href: "/announcements", label: "Announcements" },
              { href: "/forum", label: "Discussion Board" },
              { href: "/profile", label: "My Profile" },
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
        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
