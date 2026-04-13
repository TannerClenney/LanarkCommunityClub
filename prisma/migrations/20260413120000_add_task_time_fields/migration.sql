-- Add optional shift window fields to Task without affecting existing rows.
ALTER TABLE "Task"
  ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
