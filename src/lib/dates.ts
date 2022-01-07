import { formatInTimeZone } from 'date-fns-tz';

export function toUserDate(date: string | Date, timezone: string) {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

export function handleDateParam(d: null | string | Date, timezone: string) {
  if (!d) {
    return undefined;
  }

  if (d === 'today') {
    d = new Date();
  }

  return toUserDate(d, timezone);
}
