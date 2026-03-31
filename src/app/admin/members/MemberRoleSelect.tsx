"use client";

import { useState } from "react";
import { updateMemberRole } from "@/app/actions/admin";
import type { Role } from "@/generated/prisma/enums";

const ROLES: Role[] = ["PENDING", "MEMBER", "OFFICER", "ADMIN"];

export default function MemberRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [saving, setSaving] = useState(false);

  async function handleChange(newRole: Role) {
    setSaving(true);
    await updateMemberRole(userId, newRole);
    setRole(newRole);
    setSaving(false);
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as Role)}
      disabled={saving}
      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white disabled:opacity-60"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
