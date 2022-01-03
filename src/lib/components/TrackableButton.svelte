<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';

  export let label: string;
  export let color: string;
  export let countable = false;
  export let count = 0;

  export let plus = false;

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  function calculateContrastingLuminance(color: d3.LabColor) {
    const MIN_DIFF = 50;
    const MAX_DIFF = 90;

    let l = color.l;
    let output = 100 - l;
    let contrast = Math.abs(l - output);
    let hoverBgColor: d3.LabColor;
    let textColor: d3.LabColor;
    let hoverTextColor: d3.LabColor;
    const k = Math.min(0.75, Math.max(contrast / 100, 0.25));
    if (l < output) {
      if (contrast < MIN_DIFF) {
        output = l + MIN_DIFF;
      } else if (contrast > MAX_DIFF) {
        output = l + MAX_DIFF;
      }
      textColor = d3.lab(output, color.a, color.b);
      hoverTextColor = textColor.brighter(k);
      hoverBgColor = color.brighter(k);
    } else {
      if (contrast < MIN_DIFF) {
        output = l - MIN_DIFF;
      } else if (contrast > MAX_DIFF) {
        output = l - MAX_DIFF;
      }

      textColor = d3.lab(output, color.a, color.b);
      hoverTextColor = textColor.darker(k);
      hoverBgColor = color.darker(k);
    }

    return {
      textColor: textColor.rgb().toString(),
      hoverTextColor: hoverTextColor.rgb().toString(),
      hoverBgColor: hoverBgColor.rgb().toString(),
    };
  }

  $: labColor = d3.lab(color);
  $: innerBorderColor =
    labColor.l < 50 ? 'border-white border-opacity-30' : 'border-black border-opacity-20';
  $: ({ textColor, hoverTextColor, hoverBgColor } = calculateContrastingLuminance(labColor));

  // When not showing a button, we don't render it and instead expand the center button to include its space. This
  // makes the hover effects look proper.
  let centerButtonClasses: string;
  $: if (plus) {
    centerButtonClasses = 'px-4 rounded-l-full';
  } else {
    centerButtonClasses = 'pl-4 pr-14 rounded-full';
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
    <span class="flex-1 ml-4">
      {label}
    </span>
  </button>
  {#if plus}
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
