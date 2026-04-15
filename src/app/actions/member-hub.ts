"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { TaskStatus } from "@/generated/prisma/enums";

const TaskIdSchema = z.string().cuid();
const TaskTitleSchema = z.string().trim().min(2).max(200);
const TaskDescriptionSchema = z.string().trim().max(500).optional();
const TaskDateTimeSchema = z.coerce.date().optional();

export async function takeTaskOwnership(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated." };
  if (session.user.role === "PENDING") return { success: false, error: "Account pending approval." };
  if (!hasDatabase()) return { success: false, error: "Database is not configured." };

  const parsed = TaskIdSchema.safeParse(taskId);
  if (!parsed.success) return { success: false, error: "Invalid task." };

  const task = await db.task.findUnique({
    where: { id: parsed.data },
    include: {
      event: { select: { slug: true } },
      eventArea: { select: { slug: true } },
      owner: { select: { name: true } },
    },
  });

  if (!task) return { success: false, error: "Task not found." };
  if (task.status !== TaskStatus.OPEN) {
    const ownerName = task.owner?.name;
    return {
      success: false,
      error: ownerName ? `Already owned by ${ownerName}.` : "This task is no longer open.",
    };
  }

  await db.task.update({
    where: { id: task.id },
    data: {
      status: TaskStatus.OWNED,
      ownerId: session.user.id,
    },
  });

  const eventSlug = task.event.slug;

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/my-commitments");
  revalidatePath(`/members/events/${eventSlug}`);
  revalidatePath(`/members/events/${eventSlug}/areas/${task.eventArea.slug}`);

  return { success: true };
}

export async function createAreaTask(
  eventId: string,
  eventAreaId: string,
  eventSlug: string,
  areaSlug: string,
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  if (session.user.role === "PENDING") return;
  if (!hasDatabase()) return;

  const parsedEventId = TaskIdSchema.safeParse(eventId);
  const parsedAreaId = TaskIdSchema.safeParse(eventAreaId);
  const parsedTitle = TaskTitleSchema.safeParse(formData.get("title"));
  const rawDescription = typeof formData.get("description") === "string" ? String(formData.get("description")) : "";
  const parsedDescription = TaskDescriptionSchema.safeParse(rawDescription.length > 0 ? rawDescription : undefined);

  // Read separate date + time fields and combine into Date values
  const rawShiftDate = typeof formData.get("shiftDate") === "string" ? String(formData.get("shiftDate")).trim() : "";
  const rawStartClock = typeof formData.get("startClockTime") === "string" ? String(formData.get("startClockTime")).trim() : "";
  const rawEndClock = typeof formData.get("endClockTime") === "string" ? String(formData.get("endClockTime")).trim() : "";

  let startTime: Date | null = null;
  let endTime: Date | null = null;

  if (rawShiftDate && /^\d{4}-\d{2}-\d{2}$/.test(rawShiftDate)) {
    if (rawStartClock && /^\d{2}:\d{2}$/.test(rawStartClock)) {
      const parsed = new Date(`${rawShiftDate}T${rawStartClock}:00`);
      if (!Number.isNaN(parsed.getTime())) startTime = parsed;
    }
    if (rawEndClock && /^\d{2}:\d{2}$/.test(rawEndClock)) {
      const parsed = new Date(`${rawShiftDate}T${rawEndClock}:00`);
      if (!Number.isNaN(parsed.getTime())) endTime = parsed;
    }
  }

  // [DIAG] trace submitted form values
  console.log("[createAreaTask] raw form →", {
    title: formData.get("title"),
    description: formData.get("description"),
    shiftDate: rawShiftDate || "(empty)",
    startClock: rawStartClock || "(empty)",
    endClock: rawEndClock || "(empty)",
    startTime,
    endTime,
  });

  if (!parsedEventId.success || !parsedAreaId.success || !parsedTitle.success || !parsedDescription.success) {
    console.log("[createAreaTask] validation failed →", {
      eventId: parsedEventId.success,
      areaId: parsedAreaId.success,
      title: parsedTitle.success,
      description: parsedDescription.success,
    });
    return;
  }

  const area = await db.eventArea.findFirst({
    where: {
      id: parsedAreaId.data,
      eventId: parsedEventId.data,
      event: { archived: false },
    },
    select: { id: true },
  });

  if (!area) {
    console.log("[createAreaTask] area not found for", { eventId: parsedEventId.data, areaId: parsedAreaId.data });
    return;
  }

  const currentOrder = await db.task.aggregate({
    where: { eventAreaId: area.id },
    _max: { displayOrder: true },
  });

  const createPayload = {
    eventId: parsedEventId.data,
    eventAreaId: area.id,
    title: parsedTitle.data,
    description: parsedDescription.data ?? null,
    status: TaskStatus.OPEN,
    ownerId: null,
    displayOrder: (currentOrder._max.displayOrder ?? -1) + 1,
    startTime,
    endTime,
  };
  console.log("[createAreaTask] prisma create payload →", createPayload);

  try {
    const created = await db.task.create({ data: createPayload });
    console.log("[createAreaTask] task created ✓", created.id);
  } catch (err) {
    console.error("[createAreaTask] prisma create FAILED →", err);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/my-commitments");
  revalidatePath(`/members/events/${eventSlug}`);
  revalidatePath(`/members/events/${eventSlug}/areas/${areaSlug}`);
}
