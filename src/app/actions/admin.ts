"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role, TaskStatus } from "@/generated/prisma/enums";
import { slugifyEventTitle } from "@/lib/member-hub";
import { isBoardOrAdminRole } from "@/lib/roles";

async function requireBoardOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (!isBoardOrAdminRole(session.user.role)) {
    throw new Error("Insufficient permissions.");
  }
  return session;
}

function revalidateEventPaths(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  if (slug) {
    revalidatePath(`/events/${slug}`);
    revalidatePath(`/members/events/${slug}`);
  }
}

function revalidateEventSetupPaths(eventId: string, slug?: string | null) {
  revalidateEventPaths(slug);
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/areas`);
  revalidatePath(`/admin/events/${eventId}/tasks`);
}

// ─── Events ──────────────────────────────────────────────────────────────────

const EventSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().trim().max(120).optional(),
  description: z.string().min(5).max(2000),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  membersOnly: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  showInMemberHub: z.boolean().default(true),
  archived: z.boolean().default(false),
});

export async function createEvent(formData: FormData) {
  await requireBoardOrAdmin();
  const raw = {
    title: formData.get("title"),
    slug: typeof formData.get("slug") === "string" ? (formData.get("slug") as string).trim() || undefined : undefined,
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    membersOnly: formData.get("membersOnly") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    showInMemberHub: formData.get("showInMemberHub") === "true",
    archived: formData.get("archived") === "true",
  };
  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const slug = slugifyEventTitle(parsed.data.slug || parsed.data.title);
  const existingEvent = await db.event.findFirst({ where: { slug } });
  if (existingEvent) {
    return { success: false, error: "An event with that slug already exists." };
  }

  await db.event.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      location: parsed.data.location,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      isPublic: !parsed.data.membersOnly,
      isFeatured: parsed.data.isFeatured,
      showInMemberHub: parsed.data.showInMemberHub,
      archived: parsed.data.archived,
    },
  });

  revalidateEventPaths(slug);
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  await requireBoardOrAdmin();
  const raw = {
    title: formData.get("title"),
    slug: typeof formData.get("slug") === "string" ? (formData.get("slug") as string).trim() || undefined : undefined,
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    membersOnly: formData.get("membersOnly") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    showInMemberHub: formData.get("showInMemberHub") === "true",
    archived: formData.get("archived") === "true",
  };
  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const currentEvent = await db.event.findUnique({ where: { id }, select: { slug: true } });
  if (!currentEvent) return { success: false, error: "Event not found." };

  const slug = slugifyEventTitle(parsed.data.slug || parsed.data.title);
  const existingEvent = await db.event.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existingEvent) {
    return { success: false, error: "An event with that slug already exists." };
  }

  await db.event.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      location: parsed.data.location,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      isPublic: !parsed.data.membersOnly,
      isFeatured: parsed.data.isFeatured,
      showInMemberHub: parsed.data.showInMemberHub,
      archived: parsed.data.archived,
    },
  });

  revalidateEventPaths(currentEvent.slug);
  revalidateEventPaths(slug);
  return { success: true };
}

export async function archiveEvent(id: string) {
  await requireBoardOrAdmin();
  const event = await db.event.update({
    where: { id },
    data: { archived: true, showInMemberHub: false },
    select: { slug: true },
  });
  revalidateEventPaths(event.slug);
  return { success: true };
}

export async function restoreEvent(id: string) {
  await requireBoardOrAdmin();
  const event = await db.event.update({
    where: { id },
    data: { archived: false },
    select: { slug: true },
  });
  revalidateEventPaths(event.slug);
  return { success: true };
}

export async function hideEventFromMemberHub(id: string) {
  await requireBoardOrAdmin();
  const event = await db.event.update({
    where: { id },
    data: { showInMemberHub: false },
    select: { slug: true },
  });
  revalidateEventPaths(event.slug);
  return { success: true };
}

export async function showEventInMemberHub(id: string) {
  await requireBoardOrAdmin();
  const event = await db.event.update({
    where: { id },
    data: { showInMemberHub: true },
    select: { slug: true },
  });
  revalidateEventPaths(event.slug);
  return { success: true };
}

const EventAreaSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().min(2).max(500),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export async function createEventArea(eventId: string, formData: FormData) {
  await requireBoardOrAdmin();

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { success: false, error: "Event not found." };

  const parsed = EventAreaSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    displayOrder: formData.get("displayOrder") || "0",
  });
  if (!parsed.success) return { success: false, error: "Invalid area input." };

  const slug = slugifyEventTitle(parsed.data.slug || parsed.data.name);

  try {
    await db.eventArea.create({
      data: {
        eventId: event.id,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        displayOrder: parsed.data.displayOrder,
      },
    });
  } catch {
    return { success: false, error: "Could not save area. Check for a duplicate slug." };
  }

  revalidateEventSetupPaths(event.id, event.slug);
  return { success: true };
}

export async function updateEventArea(id: string, eventId: string, formData: FormData) {
  await requireBoardOrAdmin();

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { success: false, error: "Event not found." };

  const parsed = EventAreaSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    displayOrder: formData.get("displayOrder") || "0",
  });
  if (!parsed.success) return { success: false, error: "Invalid area input." };

  const slug = slugifyEventTitle(parsed.data.slug || parsed.data.name);
  const existingArea = await db.eventArea.findFirst({
    where: {
      eventId: event.id,
      slug,
      NOT: { id },
    },
    select: { id: true },
  });
  if (existingArea) {
    return { success: false, error: "Another area already uses that slug." };
  }

  await db.eventArea.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      displayOrder: parsed.data.displayOrder,
    },
  });

  revalidateEventSetupPaths(event.id, event.slug);
  return { success: true };
}

export async function deleteEventArea(id: string) {
  await requireBoardOrAdmin();

  const area = await db.eventArea.findUnique({
    where: { id },
    select: {
      id: true,
      event: { select: { id: true, slug: true } },
    },
  });
  if (!area) return { success: false };

  await db.eventArea.delete({ where: { id } });
  revalidateEventSetupPaths(area.event.id, area.event.slug);
  return { success: true };
}

const EventTaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(500).optional(),
  eventAreaId: z.string().cuid(),
  status: z.nativeEnum(TaskStatus),
  ownerId: z.string().cuid().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export async function createEventTask(eventId: string, formData: FormData) {
  await requireBoardOrAdmin();

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { success: false, error: "Event not found." };

  const parsed = EventTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    eventAreaId: formData.get("eventAreaId"),
    status: formData.get("status"),
    ownerId: formData.get("ownerId") || undefined,
    displayOrder: formData.get("displayOrder") || "0",
  });
  if (!parsed.success) return { success: false, error: "Invalid task input." };

  const area = await db.eventArea.findFirst({
    where: { id: parsed.data.eventAreaId, eventId: event.id },
    select: { id: true },
  });
  if (!area) return { success: false, error: "Choose an area for this event." };

  const normalizedStatus = parsed.data.ownerId
    ? parsed.data.status
    : parsed.data.status === TaskStatus.OWNED
      ? TaskStatus.OPEN
      : parsed.data.status;

  try {
    await db.task.create({
      data: {
        eventId: event.id,
        eventAreaId: parsed.data.eventAreaId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: normalizedStatus,
        ownerId: parsed.data.ownerId || null,
        displayOrder: parsed.data.displayOrder,
      },
    });
  } catch {
    return { success: false, error: "Could not save task. Check for a duplicate title in this area." };
  }

  revalidateEventSetupPaths(event.id, event.slug);
  return { success: true };
}

export async function updateEventTask(id: string, eventId: string, formData: FormData) {
  await requireBoardOrAdmin();

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true },
  });
  if (!event) return { success: false, error: "Event not found." };

  const parsed = EventTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    eventAreaId: formData.get("eventAreaId"),
    status: formData.get("status"),
    ownerId: formData.get("ownerId") || undefined,
    displayOrder: formData.get("displayOrder") || "0",
  });
  if (!parsed.success) return { success: false, error: "Invalid task input." };

  const area = await db.eventArea.findFirst({
    where: { id: parsed.data.eventAreaId, eventId: event.id },
    select: { id: true },
  });
  if (!area) return { success: false, error: "Choose an area for this event." };

  const normalizedStatus = parsed.data.ownerId
    ? parsed.data.status
    : parsed.data.status === TaskStatus.OWNED
      ? TaskStatus.OPEN
      : parsed.data.status;

  try {
    await db.task.update({
      where: { id },
      data: {
        eventAreaId: parsed.data.eventAreaId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: normalizedStatus,
        ownerId: parsed.data.ownerId || null,
        displayOrder: parsed.data.displayOrder,
      },
    });
  } catch {
    return { success: false, error: "Could not update task. Check for a duplicate title in this area." };
  }

  revalidateEventSetupPaths(event.id, event.slug);
  return { success: true };
}

export async function deleteEventTask(id: string) {
  await requireBoardOrAdmin();

  const task = await db.task.findUnique({
    where: { id },
    select: {
      id: true,
      event: { select: { id: true, slug: true } },
    },
  });
  if (!task) return { success: false };

  await db.task.delete({ where: { id } });
  revalidateEventSetupPaths(task.event.id, task.event.slug);
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  const session = await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
  await db.announcement.update({ where: { id }, data: { archived: true } });
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function updateMemberRole(userId: string, role: Role) {
  await requireBoardOrAdmin();
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/members");
  return { success: true };
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function markContactRead(id: string) {
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
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
  await requireBoardOrAdmin();
  await db.thread.update({ where: { id }, data: { locked } });
  revalidatePath("/forum");
  revalidatePath(`/forum/${id}`);
  revalidatePath("/dashboard");
}

export async function archiveThread(id: string) {
  await requireBoardOrAdmin();
  await db.thread.update({ where: { id }, data: { archived: true } });
  revalidatePath("/forum");
  revalidatePath(`/forum/${id}`);
  revalidatePath("/dashboard");
}

export async function archivePost(id: string, threadId: string) {
  await requireBoardOrAdmin();
  await db.post.update({ where: { id }, data: { archived: true } });
  await db.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
  revalidatePath("/forum");
  revalidatePath(`/forum/${threadId}`);
  revalidatePath("/dashboard");
}
