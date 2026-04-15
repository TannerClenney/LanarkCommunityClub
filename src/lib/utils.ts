export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatCompactShiftRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dayLabel = startDate.toLocaleDateString("en-US", {
    weekday: "short",
  }).toUpperCase();

  const startParts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(startDate);
  const endParts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(endDate);

  const readParts = (parts: Intl.DateTimeFormatPart[]) => ({
    hour: parts.find((part) => part.type === "hour")?.value ?? "",
    minute: parts.find((part) => part.type === "minute")?.value ?? "00",
    dayPeriod: parts.find((part) => part.type === "dayPeriod")?.value?.toUpperCase() ?? "",
  });

  const startTime = readParts(startParts);
  const endTime = readParts(endParts);
  const startClock = `${startTime.hour}:${startTime.minute}`;
  const endClock = `${endTime.hour}:${endTime.minute}`;
  const rangeLabel = startTime.dayPeriod === endTime.dayPeriod
    ? `${startClock}–${endClock} ${endTime.dayPeriod}`
    : `${startClock} ${startTime.dayPeriod}–${endClock} ${endTime.dayPeriod}`;

  return `${dayLabel} • ${rangeLabel}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
