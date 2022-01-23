import { browser } from '$app/env';
import { session } from '$app/stores';
import { get } from 'svelte/store';
import { Theme } from './styles';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Session {
  theme: Theme;
  defaultDarkMode: boolean;
  randomColor: string;
  timezone: string;
  trackableView?: string;
  returnValue: Record<string, unknown>;
}

export function setSessionStateCookie(key: string, value: string | number | boolean) {
  if (browser) {
    value = encodeURIComponent(value);
    document.cookie = `${key}=${value};max-age=31536000`;
  }
}

let sessionInited = false;
export function updateSession(key: string, value: string | number | boolean) {
  if (!browser) {
    return;
  }

  if (!sessionInited) {
    // The session store requires that you subscribe to it once before setting anything on it,
    // so just fake that here.
    get(session);
    sessionInited = true;
  }

  session.update((sess) => {
    return {
      ...sess,
      [key]: value,
    };
  });

  setSessionStateCookie(key, value);
}
