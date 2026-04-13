import { connection } from "next/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isBoardOrAdminRole } from "@/lib/roles";
import { getClubTopicDefinition } from "@/lib/forum-topics";
import { archivePost, archiveThread, lockThread } from "@/app/actions/admin";
import ReplyForm from "./ReplyForm";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const [{ id }, session] = await Promise.all([params, auth()]);

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

  const canModerate = isBoardOrAdminRole(session?.user?.role);
  const topicInfo = thread.pinned ? getClubTopicDefinition(thread.title) : null;

  return (
    <div className="space-y-4">
      <Link href="/forum" className="text-sm text-green-700 hover:underline inline-block">
        ← Back to Discussion Board
      </Link>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {thread.pinned && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                    Club Topic
                  </span>
                )}
                {thread.locked && (
                  <span className="text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-0.5 font-medium">
                    Locked
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{thread.title}</h1>
              <p className="text-xs text-gray-400 mt-1">
                Started by {thread.author.name ?? "Club leadership"} · {formatDateTime(thread.createdAt)}
              </p>
            </div>

            {canModerate && (
              <div className="flex flex-wrap gap-2">
                <form action={lockThread.bind(null, thread.id, !thread.locked)}>
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    {thread.locked ? "Unlock Thread" : "Lock Thread"}
                  </button>
                </form>
                <form action={archiveThread.bind(null, thread.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Archive Thread
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 bg-white">
          <div className={thread.pinned ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4" : ""}>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">
              {thread.pinned ? "Topic Intro" : "Thread Starter"}
            </p>
            {topicInfo && <p className="text-sm text-emerald-800 mb-3">{topicInfo.summary}</p>}
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{thread.body}</div>
          </div>
        </div>

        {thread.posts.length > 0 ? (
          <div>
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-700">
                {thread.pinned ? "Updates & Discussion" : "Replies"}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {thread.posts.map((post) => (
                <div key={post.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-2">
                        {post.author.name ?? "Club member"} · {formatDateTime(post.createdAt)}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.body}</p>
                    </div>
                    {canModerate && (
                      <form action={archivePost.bind(null, post.id, thread.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete Post
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 text-sm text-gray-500">
            {thread.pinned ? "No updates yet. Add the first reply when there is something new for members to see." : "No replies yet."}
          </div>
        )}

        {!thread.locked && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 mb-3">
              {thread.pinned ? "Add an Update or Reply" : "Post a Reply"}
            </h2>
            <ReplyForm threadId={thread.id} />
          </div>
        )}
      </div>
    </div>
  );
}
