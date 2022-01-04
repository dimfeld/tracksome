import { getContext, setContext } from 'svelte';
import { Readable } from 'svelte/store';
import { User } from './user';

export interface AppContext {
  user: Readable<User | null>;
}

const CONTEXT_KEY = 'tracksome:appContext';

export function createAppContext(context: AppContext) {
  setContext(CONTEXT_KEY, context);
}

export function appContext(): AppContext {
  return getContext(CONTEXT_KEY);
}
