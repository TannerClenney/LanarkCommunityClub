import type { Role } from "@/generated/prisma/enums";

export const BOARD_OR_ADMIN_ROLES: Role[] = [
  "ADMIN",
  "OFFICER",
  "PRESIDENT",
  "VICE_PRESIDENT",
  "TREASURER",
  "SECRETARY",
];

export const ASSIGNABLE_ROLES: Role[] = [
  "PENDING",
  "MEMBER",
  "SECRETARY",
  "TREASURER",
  "VICE_PRESIDENT",
  "PRESIDENT",
  "OFFICER",
  "ADMIN",
];

export function isBoardOrAdminRole(role?: Role | string | null): boolean {
  if (!role) return false;
  return BOARD_OR_ADMIN_ROLES.includes(role as Role);
}

export function formatRoleLabel(role?: Role | string | null): string {
  if (!role) return "Member";

  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
