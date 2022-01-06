import { getContext, setContext } from 'svelte';
import { derived, Readable, writable, Writable } from 'svelte/store';
import { get } from 'svelte/store';
import { session } from '$app/stores';
import { browser } from '$app/env';

export interface DarkModeStore extends Writable<boolean | null> {
  resolved(): ResolvedDarkModeStore;
}
export type ResolvedDarkModeStore = Readable<boolean>;

export function createDarkStore(): DarkModeStore {
  let initialDarkMode: boolean | null = null;

  if (browser) {
    document.cookie = `defaultDarkMode=${cssDarkModePreference()};max-age=31536000`;
  }

  if (browser && 'theme' in window.localStorage) {
    initialDarkMode = window.localStorage.theme === 'true';
  } else {
    let sess = get(session);
    let { theme, defaultDarkMode } = sess;
    if (theme === 'true' || theme === 'false') {
      initialDarkMode = theme;
    } else if (browser) {
      return defaultDarkMode ?? false;
    }
  }

  let darkModeStore = writable(initialDarkMode);

  let s = {
    ...darkModeStore,
    resolved() {
      return derived(darkModeStore, (d) => d ?? cssDarkModePreference());
    },
    set(value: boolean | null) {
      localStorage.theme = value;
      document.cookie = `theme=${value};max-age=31536000`;
      darkModeStore.set(value);
    },
  };

  setContext('darkModeStore', s);
  return s;
}

export function darkModeStore() {
  return getContext<DarkModeStore>('darkModeStore');
}

export function cssDarkModePreference() {
  if (!browser) {
    let sess = get(session);
    return sess.defaultDarkMode ?? false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
