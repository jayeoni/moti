import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function daysUntil(isoDate: string): number {
  return differenceInCalendarDays(parseISO(isoDate), startOfDay(new Date()));
}

export function getWeekDates(referenceDate?: string): string[] {
  const ref = referenceDate ? parseISO(referenceDate) : new Date();
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(ref, 6 - i), 'yyyy-MM-dd')
  );
}

export function formatDisplayDate(isoDate: string): string {
  return format(parseISO(isoDate), 'MMM d');
}

export function formatRelativeDate(isoDate: string): string {
  const days = daysUntil(isoDate);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function formatDayName(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE');
}
