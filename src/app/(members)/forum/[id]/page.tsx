import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import ReplyForm from "./ReplyForm";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const thread = await db.thread.findUnique({
    where: { id, archived: false },
    include: {
      author: { select: { name: true } },
      posts: {
        where: { archived: false },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!thread) notFound();

  return (
    <div>
      <Link href="/forum" className="text-sm text-green-700 hover:underline mb-4 inline-block">
        ← Back to Discussion Board
      </Link>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Thread header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            {thread.pinned && <span className="text-xs text-yellow-600">📌</span>}
            {thread.locked && <span className="text-xs text-gray-400">🔒 Locked</span>}
            <h1 className="text-xl font-bold text-gray-900">{thread.title}</h1>
          </div>
          <p className="text-xs text-gray-400">
            Started by {thread.author.name} · {formatDateTime(thread.createdAt)}
          </p>
          <div className="mt-4 text-gray-700 text-sm whitespace-pre-wrap">{thread.body}</div>
        </div>

        {/* Replies */}
        {thread.posts.length > 0 && (
          <div className="divide-y divide-gray-100">
            {thread.posts.map((post) => (
              <div key={post.id} className="p-5">
                <p className="text-xs text-gray-400 mb-2">
                  {post.author.name} · {formatDateTime(post.createdAt)}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {!thread.locked && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 mb-3">Post a Reply</h2>
            <ReplyForm threadId={thread.id} />
          </div>
        )}
      </div>
    </div>
  );
}
