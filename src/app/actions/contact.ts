"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(2000),
});

export async function submitContact(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Please check your input and try again." };
  }

  await db.contactSubmission.create({
    data: parsed.data,
  });

  return { success: true };
}
