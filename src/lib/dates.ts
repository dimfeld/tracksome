import { formatInTimeZone } from 'date-fns-tz';

export function toUserDate(date: string | Date, timezone: string) {
  return formatInTimeZone(date, timezone, 'YYYY-MM-dd');
}
