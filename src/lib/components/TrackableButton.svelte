<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';

  export let label: string;
  export let color: string;

  export let plus = false;
  export let list = false;

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  $: labColor = d3.lab(color);
  $: textLum = 100 - labColor.l;
  $: textColor = d3.lab(textLum, labColor.a, labColor.b).rgb().toString();
  // $: textColor = darkBg ? 'text-gray-300' : 'text-gray-900';
</script>

<div
  class="flex rounded-full px-3 shadow-current drop-shadow-lg"
  style="background-color:{color};color:{textColor}"
>
  <button
    on:click={() => dispatch('click-list')}
    class="w-8 pr-1 border-gray-300 border-opacity-50"
    class:border-r={list}
    disabled={!list}
  >
    {#if list}
      <!-- Heroicons list -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 opacity-50"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>
  <button class="py-2 px-4" on:click>{label}</button>
  <button
    on:click={() => dispatch('click-plus')}
    class="w-8 pl-2 border-gray-300 border-opacity-50"
    class:border-l={plus}
  >
    {#if plus}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 opacity-50"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>
</div>
