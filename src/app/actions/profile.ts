"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated." };

  const raw = {
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return { success: true };
}
