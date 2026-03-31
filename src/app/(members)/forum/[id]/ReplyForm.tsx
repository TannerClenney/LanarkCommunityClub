"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/forum";
import { useRouter } from "next/navigation";

export default function ReplyForm({ threadId }: { threadId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("threadId", threadId);
    const result = await createPost(formData);
    if (result.success) {
      setStatus("idle");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error ?? "Failed to post reply.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="body"
        required
        minLength={1}
        maxLength={5000}
        rows={4}
        placeholder="Write your reply…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y"
      />
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-green-700 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-green-600 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "Posting…" : "Post Reply"}
      </button>
    </form>
  );
}
