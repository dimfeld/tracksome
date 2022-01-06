<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { contrastingColor } from '$lib/colors';
  import { submit } from '$lib/actions';
  import * as d3 from 'd3';
  import { invalidate } from '$app/navigation';

  export let label: string;
  export let trackable_id: number;
  export let color: string;
  export let countable = false;
  export let count = 0;

  export let plus = false;

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  $: labColor = d3.lab(color);
  $: innerBorderColor =
    labColor.l < 50 ? 'border-white border-opacity-30' : 'border-black border-opacity-20';
  $: ({ textColor, hoverTextColor, hoverBgColor } = contrastingColor(labColor));

  // When not showing a button, we don't render it and instead expand the center button to include its space. This
  // makes the hover effects look proper.
  let centerButtonClasses: string;
  $: if (plus) {
    centerButtonClasses = 'px-4 rounded-l-full';
  } else {
    centerButtonClasses = 'pl-4 pr-14 rounded-full';
  }

  function newItemSubmit() {
    count++;
  }

  function newItemResponse(res: Response) {
    if (res.ok) {
      invalidate('/items');
    } else {
      count--;
    }
  }
</script>

<div
  class="flex shadow-current drop-shadow-lg"
  style="--normal-bg-color:{color};color:{textColor};--hover-text-color:{hoverTextColor};--hover-bg-color:{hoverBgColor}"
>
  <button class="py-2 flex-1 truncate flex {centerButtonClasses}" on:click>
    <span class="w-4 mr-auto opacity-60"
      >{#if count}
        {#if countable}
          {count}
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        {/if}
      {/if}</span
    >
    <span class="flex-1 ml-4 truncate">
      {label}
    </span>
  </button>
  {#if plus}
    <form method="POST" action="/items" use:submit={{ onResponse: newItemResponse }}>
      <input type="hidden" name="trackable_id" value={trackable_id} />
      <button
        on:click={() => dispatch('click-plus')}
        class="w-10 pl-2 pr-2 rounded-r-full {innerBorderColor}"
        class:border-l={plus}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 opacity-60"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </form>
  {/if}
</div>

<style>
  button {
    background-color: var(--normal-bg-color);
  }

  button:hover {
    background-color: var(--hover-bg-color);
    color: var(--hover-text-color);
  }
</style>
