import { getContext, setContext } from 'svelte';
import { Readable } from 'svelte/store';
import { LoadingStore } from './loader_status';
import { ToastStore } from './toast';
import { User } from './user';

export interface AppContext {
  user: Readable<User | null>;
  loading: LoadingStore;
  toasts: ToastStore;
}

const CONTEXT_KEY = 'tracksome:appContext';

export function createAppContext(context: AppContext) {
  setContext(CONTEXT_KEY, context);
}

export function appContext(): AppContext {
  return getContext(CONTEXT_KEY);
}
