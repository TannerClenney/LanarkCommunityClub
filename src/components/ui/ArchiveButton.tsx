"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveButton({
  id,
  action,
  label = "Archive",
  className,
}: {
  id: string;
  action: (id: string) => Promise<{ success: boolean }>;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirm(`Are you sure you want to ${label.toLowerCase()} this item?`)) return;
    setLoading(true);
    await action(id);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className ?? "text-xs text-red-600 hover:underline disabled:opacity-50"}
    >
      {loading ? "…" : label}
    </button>
  );
}
