import { browser } from '$app/env';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export interface SessionWithTimezone {
  timezone: string;
}

export function currentTimezone(session?: SessionWithTimezone): string {
  if (browser) {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
  } else {
    return session?.timezone ?? 'UTC';
  }
}

export function dateInUserTimezone(session: SessionWithTimezone, date: Date): string {
  let timezone = currentTimezone(session);
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

export function formatAsDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export type DateGranularity = 'day' | '7d' | 'week' | 'month' | '30d';
export interface DateRange {
  start: Date;
  end: Date;
}

export function dateRange(baseDate: Date, granularity: DateGranularity, delta = 0): DateRange {
  let start: Date;
  let end: Date;
  switch (granularity) {
    default:
    case 'day':
      start = addDays(baseDate, delta);
      end = addDays(baseDate, delta);
      break;
    case '7d':
      start = addDays(baseDate, delta * 7);
      end = addDays(baseDate, (delta - 1) * 7);
      break;
    case '30d':
      start = addDays(baseDate, delta * 30);
      end = addDays(baseDate, (delta - 1) * 30);
      break;
    case 'week':
      start = startOfWeek(addWeeks(baseDate, delta));
      end = endOfWeek(addWeeks(baseDate, delta));
      break;
    case 'month':
      start = startOfMonth(addMonths(baseDate, delta));
      end = endOfMonth(addMonths(baseDate, delta));
      break;
  }

  return { start, end };
}

export function addGranularity(baseDate: Date, granularity: DateGranularity, delta: number) {
  switch (granularity) {
    default:
    case 'day':
      return addDays(baseDate, delta);
    case 'week':
      return addWeeks(baseDate, delta);
    case 'month':
      return addMonths(baseDate, delta);
    case '7d':
      return addDays(baseDate, delta * 7);
    case '30d':
      return addDays(baseDate, delta * 30);
  }
}

export function dateOrToday(date: string | null, timezone: string): Date {
  if (!date || date === 'today') {
    return new Date();
  }

  return zonedTimeToUtc(date, timezone);
}
