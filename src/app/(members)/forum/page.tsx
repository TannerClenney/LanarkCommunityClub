import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { stickyTopics } from "@/lib/mock-data";
import NewThreadButton from "./NewThreadButton";

export const metadata: Metadata = { title: "Discussion Board" };

async function getDiscussionThreads() {
  await connection();
  return db.thread.findMany({
    where: { archived: false, pinned: false },
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { posts: { where: { archived: false } } } },
    },
  });
}

export default async function ForumPage() {
  const threads = await getDiscussionThreads();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-700">Discussion Board</h1>
        <NewThreadButton />
      </div>

      {/* Sticky Topics */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-600 mb-3">
          Club Topics
        </h2>
        <div className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden divide-y divide-emerald-50">
          {stickyTopics.map((topic) => (
            <Link
              key={topic.id}
              href={topic.href}
              className="flex items-start justify-between p-4 hover:bg-stone-50 transition-colors group"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                  {topic.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{topic.description}</p>
              </div>
              <p className="text-xs text-zinc-400 shrink-0 ml-4 mt-0.5">{topic.updatedLabel}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Discussions */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
          Community Discussions
        </h2>
        {threads.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-stone-50 p-8 text-center text-zinc-400 text-sm">
            No discussions yet. Start the first thread!
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden divide-y divide-zinc-100">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/${thread.id}`}
                className="flex items-start justify-between p-4 hover:bg-stone-50 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {thread.locked && (
                      <span className="text-xs text-zinc-400" title="Locked">🔒</span>
                    )}
                    <span className="font-medium text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                      {thread.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Started by {thread.author.name} · {thread._count.posts} repl{thread._count.posts === 1 ? "y" : "ies"}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 shrink-0 ml-4 mt-0.5">{formatDate(thread.updatedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
