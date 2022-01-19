<script lang="ts">
  import { appContext } from '$lib/context';
  import { DarkModeStore, Theme } from '$lib/styles';

  export let darkModeStore: DarkModeStore;

  const { user, loading } = appContext();
</script>

<nav class="flex flex-row items-center p-2 bg-dgray-200">
  <a class="text-xl" href="/">TrackSome</a>
  <div class="flex items-center ml-auto">
    <button class="text-dgray-700 w-8 h-8 grid place-items-center" title="User Settings">
      {#if $user?.avatar}
        <img src={$user.avatar} alt="{$user.name} Profile Picture" class="w-8 h-8 rounded-full" />
      {:else}
        <!-- Heroicons: generic user icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          />
        </svg>
      {/if}
    </button>
    <select class="ml-2 text-xs h-8" bind:value={$darkModeStore}>
      <option value={Theme.Dark} selected={$darkModeStore === Theme.Dark}>Dark</option>
      <option value={Theme.Light} selected={$darkModeStore === Theme.Light}>Light</option>
      <option value={Theme.System} selected={$darkModeStore === Theme.System}>System</option>
    </select>
  </div>
</nav>
