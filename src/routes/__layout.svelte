<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { setSessionStateCookie, User } from '$lib/user';

  export const load: Load = async function ({ fetch, url }) {
    if (browser) {
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Record timezone offset so that server-side queries can adjust appropriately.
      setSessionStateCookie('timezone', timezone);
    }

    let userResponse = await fetch('/api/user');
    let user: User | null;
    if (userResponse.ok) {
      user = await userResponse.json();
    } else {
      user = null;
    }

    let callback: object | undefined;
    try {
      let callbackString = url.searchParams.get('__callback');
      if (callbackString) {
        callback = JSON.parse(atob(callbackString));
      }
    } catch (e) {}

    return {
      stuff: { user, callback, title: ['TrackSome'] },
      props: { user },
    };
  };
</script>

<script lang="ts">
  import '../app.css';
  import { writable } from 'svelte/store';
  import { createDarkStore } from '$lib/styles';
  import { loadingStore } from '$lib/loader_status';
  import { createAppContext } from '$lib/context';
  import NavBar from './_NavBar.svelte';
  import Login from './login.svelte';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import { toastStore } from '$lib/toast';
  import { browser } from '$app/env';
  import { page } from '$app/stores';

  let userProp: User | null;
  export { userProp as user };

  let user = writable<User | null>(userProp);
  $: $user = userProp;

  const loading = loadingStore();
  const darkModeStore = createDarkStore();
  const darkMode = darkModeStore.resolved();
  const toasts = toastStore(darkMode);

  createAppContext({ user, loading, toasts });

  const toastOptions = {
    reversed: true,
    intro: { y: 100 },
  };
</script>

<svelte:head>
  <title>{$page.stuff.title.slice().reverse().join(' - ')}</title>
</svelte:head>

<div id="tracksome-top" class:dark={$darkMode}>
  <div
    class="h-screen overflow-y-auto overflow-x-hidden bg-dgray-50 text-gray-900 dark:text-gray-100"
  >
    <NavBar {darkModeStore} />
    <main class="mt-2">
      {#if $user}
        <slot />
      {:else}
        <Login />
      {/if}
    </main>
  </div>
</div>

<SvelteToast options={toastOptions} />
