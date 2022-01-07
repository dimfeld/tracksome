<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { contrastingColor } from '$lib/colors';
  import { submit } from '$lib/form';
  import * as d3 from 'd3';
  import { invalidate } from '$app/navigation';
  import { Trackable } from '$lib/trackable';

  export let trackable: Trackable;
  export let count = 0;

  export let plus = false;

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  $: labColor = d3.lab(trackable.color);
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

  function newItemSubmit(data: FormData) {
    data.set('date', new Date().toISOString());
    count++;
  }

  function newItemResponse(res: Response) {
    if (res.ok) {
      invalidate('/api/items');
    } else {
      count--;
    }
  }
</script>

<div
  class="flex shadow-current drop-shadow-lg"
  style="--normal-bg-color:{trackable.color};color:{textColor};--hover-text-color:{hoverTextColor};--hover-bg-color:{hoverBgColor}"
>
  <button class="element py-2 flex-1 truncate flex {centerButtonClasses}" on:click>
    <span class="w-4 mr-auto opacity-60"
      >{#if count}
        {#if trackable.multiple_per_day}
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
      {trackable.name}
    </span>
  </button>
  {#if plus}
    <form
      class="element w-12 rounded-r-full border-l {innerBorderColor}"
      method="POST"
      action="/api/items"
      use:submit={{ onResponse: newItemResponse }}
    >
      <input type="hidden" name="trackable_id" value={trackable.trackable_id} />
      <button class="w-full h-full pl-3 rounded-r-full" on:click={() => dispatch('click-plus')}>
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
  .element {
    background-color: var(--normal-bg-color);
  }

  .element:hover {
    background-color: var(--hover-bg-color);
    color: var(--hover-text-color);
  }
</style>
