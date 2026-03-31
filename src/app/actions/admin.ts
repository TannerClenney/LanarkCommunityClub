"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/enums";

async function requireOfficer() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "ADMIN" && session.user.role !== "OFFICER") {
    throw new Error("Insufficient permissions.");
  }
  return session;
}

// ─── Events ──────────────────────────────────────────────────────────────────

const EventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function createEvent(formData: FormData) {
  await requireOfficer();
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    isPublic: formData.get("isPublic") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };
  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  await db.event.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
  });
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  await requireOfficer();
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    isPublic: formData.get("isPublic") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };
  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  await db.event.update({
    where: { id },
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { success: true };
}

export async function archiveEvent(id: string) {
  await requireOfficer();
  await db.event.update({ where: { id }, data: { archived: true } });
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { success: true };
}

// ─── Projects ────────────────────────────────────────────────────────────────

const ProjectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  status: z.enum(["completed", "ongoing", "planned"]).default("completed"),
  year: z.number().int().min(1900).max(2100).optional(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
});

export async function createProject(formData: FormData) {
  await requireOfficer();
  const yearStr = formData.get("year");
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "completed",
    year: yearStr ? parseInt(yearStr as string) : undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    isFeatured: formData.get("isFeatured") === "true",
  };
  const parsed = ProjectSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  await db.project.create({ data: parsed.data });
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function archiveProject(id: string) {
  await requireOfficer();
  await db.project.update({ where: { id }, data: { archived: true } });
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true };
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

const ScholarshipSchema = z.object({
  recipientName: z.string().min(2).max(100),
  year: z.number().int().min(1900).max(2100),
  amount: z.number().positive().optional(),
  description: z.string().max(500).optional(),
});

export async function createScholarship(formData: FormData) {
  await requireOfficer();
  const amountStr = formData.get("amount");
  const raw = {
    recipientName: formData.get("recipientName"),
    year: parseInt(formData.get("year") as string),
    amount: amountStr ? parseFloat(amountStr as string) : undefined,
    description: formData.get("description") || undefined,
  };
  const parsed = ScholarshipSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  await db.scholarship.create({ data: parsed.data });
  revalidatePath("/scholarships");
  revalidatePath("/admin/scholarships");
  return { success: true };
}

export async function archiveScholarship(id: string) {
  await requireOfficer();
  await db.scholarship.update({ where: { id }, data: { archived: true } });
  revalidatePath("/scholarships");
  revalidatePath("/admin/scholarships");
  return { success: true };
}

// ─── Announcements ───────────────────────────────────────────────────────────

const AnnouncementSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(5).max(5000),
  isPinned: z.boolean().default(false),
});

export async function createAnnouncement(formData: FormData) {
  const session = await requireOfficer();
  const raw = {
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") === "true",
  };
  const parsed = AnnouncementSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  await db.announcement.create({ data: { ...parsed.data, authorId: session.user.id } });
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function archiveAnnouncement(id: string) {
  await requireOfficer();
  await db.announcement.update({ where: { id }, data: { archived: true } });
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function updateMemberRole(userId: string, role: Role) {
  await requireOfficer();
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/members");
  return { success: true };
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function markContactRead(id: string) {
  await requireOfficer();
  await db.contactSubmission.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/contact");
  return { success: true };
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

const GallerySchema = z.object({
  title: z.string().min(2).max(200),
  imageUrl: z.string().url(),
  caption: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  featured: z.boolean().default(false),
});

export async function createGalleryItem(formData: FormData) {
  await requireOfficer();
  const raw = {
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    caption: formData.get("caption") || undefined,
    category: formData.get("category") || undefined,
    featured: formData.get("featured") === "true",
  };
  const parsed = GallerySchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  await db.galleryItem.create({ data: parsed.data });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function archiveGalleryItem(id: string) {
  await requireOfficer();
  await db.galleryItem.update({ where: { id }, data: { archived: true } });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true };
}

// ─── Highlights ───────────────────────────────────────────────────────────────

const HighlightSchema = z.object({
  heading: z.string().min(2).max(200),
  body: z.string().min(5).max(500),
  linkText: z.string().max(100).optional(),
  linkHref: z.string().max(200).optional(),
  sortOrder: z.number().int().default(0),
});

export async function createHighlight(formData: FormData) {
  await requireOfficer();
  const raw = {
    heading: formData.get("heading"),
    body: formData.get("body"),
    linkText: formData.get("linkText") || undefined,
    linkHref: formData.get("linkHref") || undefined,
    sortOrder: parseInt((formData.get("sortOrder") as string) || "0"),
  };
  const parsed = HighlightSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };
  await db.homepageHighlight.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/highlights");
  return { success: true };
}

// ─── Forum Moderation ────────────────────────────────────────────────────────

export async function lockThread(id: string, locked: boolean) {
  await requireOfficer();
  await db.thread.update({ where: { id }, data: { locked } });
  revalidatePath("/forum");
  return { success: true };
}

export async function archiveThread(id: string) {
  await requireOfficer();
  await db.thread.update({ where: { id }, data: { archived: true } });
  revalidatePath("/forum");
  return { success: true };
}
