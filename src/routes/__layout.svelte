<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { User } from '$lib/user';

  export const load: Load = async function ({ fetch }) {
    let userResponse = await fetch('/user');
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
  import { createDarkStore, cssDarkModePreference } from '$lib/styles';
  import { loadingStore } from '$lib/loader_status';
  import { createAppContext } from '$lib/context';
  import NavBar from './_NavBar.svelte';

  let userProp: User | null;
  export { userProp as user };

  let user = writable<User | null>(userProp);
  $: $user = userProp;

  let loading = loadingStore();
  createAppContext({ user, loading });

  let darkModeStore = createDarkStore();
  $: darkMode = $darkModeStore ?? cssDarkModePreference();
</script>

<div id="tracksome-top" class:dark={darkMode}>
  <div
    class="h-screen overflow-y-auto overflow-x-hidden bg-dgray-50 text-gray-900 dark:text-gray-100"
  >
    <NavBar {darkModeStore} />
    <main>
      <slot />
    </main>
  </div>
</div>
