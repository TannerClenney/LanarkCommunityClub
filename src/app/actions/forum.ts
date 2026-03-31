"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ThreadSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(5).max(5000),
});

const PostSchema = z.object({
  body: z.string().min(1).max(5000),
  threadId: z.string().cuid(),
});

export async function createThread(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated." };
  if (session.user.role === "PENDING") return { success: false, error: "Account pending approval." };

  const raw = { title: formData.get("title"), body: formData.get("body") };
  const parsed = ThreadSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const thread = await db.thread.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  return { success: true, threadId: thread.id };
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated." };
  if (session.user.role === "PENDING") return { success: false, error: "Account pending approval." };

  const raw = { body: formData.get("body"), threadId: formData.get("threadId") };
  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const thread = await db.thread.findUnique({ where: { id: parsed.data.threadId } });
  if (!thread || thread.archived) return { success: false, error: "Thread not found." };
  if (thread.locked) return { success: false, error: "This thread is locked." };

  await db.post.create({
    data: { body: parsed.data.body, threadId: parsed.data.threadId, authorId: session.user.id },
  });

  await db.thread.update({
    where: { id: parsed.data.threadId },
    data: { updatedAt: new Date() },
  });

  return { success: true };
}
