import { getContext, setContext } from 'svelte';
import { derived, Readable, writable, Writable } from 'svelte/store';

export interface DarkModeStore extends Writable<boolean | null> {
  resolved(): ResolvedDarkModeStore;
}
export type ResolvedDarkModeStore = Readable<boolean>;

export function createDarkStore(): DarkModeStore {
  let initialDarkMode: boolean | null = null;

  if (typeof window === 'undefined') {
    return {
      ...writable(false),
      resolved: () => writable(false),
    };
  }

  if ('theme' in window.localStorage) {
    initialDarkMode = window.localStorage.theme === 'true';
  }

  let darkModeStore = writable(initialDarkMode);

  let s = {
    ...darkModeStore,
    resolved() {
      return derived(darkModeStore, (d) => d ?? cssDarkModePreference());
    },
    set(value: boolean | null) {
      localStorage.theme = value;
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
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
