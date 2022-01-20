import { Readable, writable } from 'svelte/store';

export interface LoadingStore extends Readable<boolean> {
  add(key: string): void;
  delete(key: string): void;
}

export function loadingStore(): LoadingStore {
  let loading = new Map<any, number>();

  let store = writable(false);

  return {
    subscribe: store.subscribe,
    add(key: string) {
      let newValue = (loading.get(key) || 0) + 1;
      loading.set(key, newValue);
      store.set(loading.size > 0);
    },
    delete(key: string) {
      let newValue = (loading.get(key) || 0) - 1;
      if (newValue > 0) {
        loading.set(key, newValue);
      } else {
        loading.delete(key);
      }

      store.set(loading.size > 0);
    },
  };
}
