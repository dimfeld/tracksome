import { addDays, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { browser } from '$app/env';

export function toUserDate(date: string | Date, timezone: string) {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

export function handleDateParam(d: null | string | Date, timezone: string, dayDelta = 0) {
  if (!d) {
    return undefined;
  }

  let date: Date;
  if (d === 'today') {
    date = new Date();
  } else if (d instanceof Date) {
    date = d;
  } else {
    date = parseISO(d);
  }

  if (dayDelta) {
    date = addDays(date, dayDelta);
  }

  return toUserDate(date, timezone);
}

export function currentTimezone(session?: { timezone: string }): string {
  if (browser) {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
  } else {
    return session?.timezone ?? 'UTC';
  }
}
