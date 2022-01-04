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
  import { createAppContext } from '$lib/context';

  let userProp: User | null;
  export { userProp as user };

  let user = writable<User | null>(userProp);
  $: $user = userProp;

  createAppContext({ user });

  let darkModeStore = createDarkStore();
  $: darkMode = $darkModeStore ?? cssDarkModePreference();
</script>

<div id="tracksome-top" class:dark={darkMode}>
  <div
    class="h-screen overflow-y-auto overflow-x-hidden bg-dgray-50 text-gray-900 dark:text-gray-100"
  >
    <nav class="flex flex-row p-2 bg-dgray-200">
      TrackSome
      <div class="ml-auto">
        <select bind:value={$darkModeStore}>
          <option value={true}>Dark</option>
          <option value={false}>Light</option>
          <option value={null}>System</option>
        </select>
      </div>
    </nav>
    <main>
      <pre>User: {JSON.stringify($user)}</pre>
      <slot />
    </main>
  </div>
</div>
