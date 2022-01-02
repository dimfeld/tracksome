<script>
  import '../app.css';
  import { createDarkStore, cssDarkModePreference } from '$lib/styles';
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
      <slot />
    </main>
  </div>
</div>
