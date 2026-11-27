// Weeks run Monday through Sunday in the garden's timezone.

function partsInZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    isoDow: weekdays.indexOf(parts.weekday) + 1,
  };
}

function toIsoDate(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toISOString().slice(0, 10);
}

// Returns the Monday that starts the week containing `date`, as YYYY-MM-DD.
export function weekStartFor(date: Date, timeZone: string): string {
  const { year, month, day, isoDow } = partsInZone(date, timeZone);
  const monday = new Date(Date.UTC(year, month - 1, day - (isoDow - 1)));
  return monday.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return toIsoDate(y, m, d + days);
}

export function previousWeekStart(weekStart: string): string {
  return addDays(weekStart, -7);
}

// Counts consecutive weeks, ending with the current or previous week, that have at least one event.
export function streakWeeks(weekStartsWithEvents: Set<string>, currentWeekStart: string): number {
  let cursor = weekStartsWithEvents.has(currentWeekStart) ? currentWeekStart : previousWeekStart(currentWeekStart);
  let streak = 0;
  while (weekStartsWithEvents.has(cursor)) {
    streak += 1;
    cursor = previousWeekStart(cursor);
  }
  return streak;
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// "Nov 10" in the garden's timezone, with the year when it is not the current one.
export function formatRevealedDate(iso: string, timeZone: string): string {
  const date = new Date(iso);
  const sameYear = partsInZone(date, timeZone).year === partsInZone(new Date(), timeZone).year;
  return new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", year: sameYear ? undefined : "numeric" }).format(date);
}

export function formatWeekReset(weekStart: string, timeZone: string): string {
  const nextMonday = addDays(weekStart, 7);
  const [y, m, d] = nextMonday.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "short", day: "numeric" }).format(date);
}
