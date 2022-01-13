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

const granularities: Record<
  DateGranularity,
  {
    add(date: Date, delta: number): Date;
    adjustStart?(date: Date): Date;
    adjustEnd?(date: Date): Date;
    deltaEndAdjustment?: number;
    deltaMultiplier: number;
  }
> = {
  day: {
    add: addDays,
    deltaMultiplier: 1,
  },
  '7d': {
    add: addDays,
    deltaMultiplier: 7,
    deltaEndAdjustment: 1,
  },
  '30d': {
    add: addDays,
    deltaMultiplier: 30,
    deltaEndAdjustment: 1,
  },
  week: {
    add: addWeeks,
    deltaMultiplier: 1,
    adjustStart: startOfWeek,
    adjustEnd: endOfWeek,
  },
  month: {
    add: addMonths,
    deltaMultiplier: 1,
    adjustStart: startOfMonth,
    adjustEnd: endOfMonth,
  },
};

export function dateRange(baseDate: Date, granularity: DateGranularity, delta = 0): DateRange {
  const {
    add,
    deltaMultiplier,
    deltaEndAdjustment = 0,
    adjustStart,
    adjustEnd,
  } = granularities[granularity] ?? granularities.day;

  let start = add(baseDate, delta * deltaMultiplier);
  let end = add(baseDate, (delta - deltaEndAdjustment) * deltaMultiplier);

  if (adjustStart) {
    start = adjustStart(start);
  }

  if (adjustEnd) {
    end = adjustEnd(end);
  }

  if (end.valueOf() < start.valueOf()) {
    [start, end] = [end, start];
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
