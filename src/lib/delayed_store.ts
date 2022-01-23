import { derived, Readable } from 'svelte/store';

export function delayedStore<T>(sourceStore: Readable<T>, delay: number): Readable<T> {
  return derived(sourceStore, (value, set) => void setTimeout(() => set(value), delay));
}

/** A store that is true if a store's has a certain value for longer than the given duration. */
export function stuckValueStore<T>(
  sourceStore: Readable<T>,
  checkValue: T,
  duration: number
): Readable<boolean> {
  const delayed = delayedStore(sourceStore, duration);
  return derived([sourceStore, delayed], ([a, b]) => a === checkValue && b === checkValue);
}
