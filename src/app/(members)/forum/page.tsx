import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import NewThreadButton from "./NewThreadButton";

export const metadata: Metadata = { title: "Discussion Board" };

async function getThreads() {
  await connection();
  return db.thread.findMany({
    where: { archived: false },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: {
      author: { select: { name: true } },
      _count: { select: { posts: { where: { archived: false } } } },
    },
  });
}

export default async function ForumPage() {
  const threads = await getThreads();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Discussion Board</h1>
        <NewThreadButton />
      </div>

      {threads.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
          No discussions yet. Start the first thread!
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/${thread.id}`}
                className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {thread.pinned && <span className="text-xs text-yellow-600">📌</span>}
                    {thread.locked && <span className="text-xs text-gray-400">🔒</span>}
                    <span className="font-medium text-gray-900">{thread.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Started by {thread.author.name} · {thread._count.posts} replies
                  </p>
                </div>
                <p className="text-xs text-gray-400 shrink-0 ml-4">{formatDate(thread.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
