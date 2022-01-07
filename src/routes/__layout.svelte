<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { User } from '$lib/user';

  export const load: Load = async function ({ fetch }) {
    if (browser) {
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Record timezone offset so that server-side queries can adjust appropriately.
      document.cookie = `timezone=${timezone};max-age=31536000`;
    }

    let userResponse = await fetch('/user.json');
    let user: User | null;
    if (userResponse.ok) {
      user = await userResponse.json();
    } else {
      user = null;
    }

    return {
      stuff: { user },
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
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import { toastStore } from '$lib/toast';
  import { browser } from '$app/env';

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

<div id="tracksome-top" class:dark={$darkMode}>
  <div
    class="h-screen overflow-y-auto overflow-x-hidden bg-dgray-50 text-gray-900 dark:text-gray-100"
  >
    <NavBar {darkModeStore} />
    <main>
      <slot />
    </main>
  </div>
</div>

<SvelteToast options={toastOptions} />
