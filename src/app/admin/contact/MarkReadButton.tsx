"use client";

import { useState } from "react";
import { markContactRead } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function MarkReadButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    await markContactRead(id);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="text-xs text-green-700 border border-green-300 px-3 py-1 rounded-lg hover:bg-green-50 disabled:opacity-50 shrink-0">
      {loading ? "…" : "Mark Read"}
    </button>
  );
}
