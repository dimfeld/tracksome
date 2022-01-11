import { browser } from '$app/env';

export function currentTimezone(session?: { timezone: string }): string {
  if (browser) {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
  } else {
    return session?.timezone ?? 'UTC';
  }
}
