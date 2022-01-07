<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { contrastingColor } from '$lib/colors';
  import { submit } from '$lib/form';
  import * as d3 from 'd3';
  import { goto, invalidate } from '$app/navigation';
  import { Trackable } from '$lib/trackable';
  import { desktopScreen } from '$lib/styles';
  import { Item, todayItemsUrl } from '$lib/items';
  import TrackableButtonLabel from './_TrackableButtonLabel.svelte';

  export let trackable: Trackable;
  export let items: Item[];

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  $: labColor = d3.lab(trackable.color);
  $: innerBorderColor =
    labColor.l < 50 ? 'border-white border-opacity-30' : 'border-black border-opacity-20';
  $: ({ textColor, hoverTextColor, hoverBgColor } = contrastingColor(labColor));

  let detailsPopupOpen = false;

  // USe this once item editing is live.
  // $: plus = trackable.multiple_per_day;

  $: canAddNew = trackable.multiple_per_day || !items.length;

  // When not showing a button, we don't render it and instead expand the center button to include its space. This
  // makes the hover effects look proper.
  $: centerButtonClasses =
    'element py-2 flex-1 truncate' +
    (canAddNew ? 'px-4 rounded-l-full' : 'pl-4 pr-14 rounded-full');

  function newItemSubmit(data: FormData | null) {
    if (!trackable.multiple_per_day && items.length) {
      return false;
    }

    if (data) {
      data.set('date', new Date().toISOString());
    }
  }

  function newItemResponse(res: Response) {
    if (res.ok) {
      invalidate(todayItemsUrl);
    }
  }

  function showDetails(e: MouseEvent) {
    if (desktopScreen()) {
      detailsPopupOpen = true;
    } else {
      goto((e.target as HTMLAnchorElement).href);
    }
  }
</script>

<div
  class="flex shadow-current drop-shadow-lg"
  style="--normal-bg-color:{trackable.color};color:{textColor};--hover-text-color:{hoverTextColor};--hover-bg-color:{hoverBgColor}"
>
  {#if !items.length}
    <form
      class={centerButtonClasses}
      method="POST"
      action="/api/items"
      use:submit={{
        onSubmit: newItemSubmit,
        onResponse: newItemResponse,
      }}
    >
      <input type="hidden" name="trackable_id" value={trackable.trackable_id} />
      <button type="submit" class="flex w-full">
        <TrackableButtonLabel {trackable} {items} />
      </button>
    </form>
  {:else}
    <a
      class="{centerButtonClasses} flex w-full"
      href="/trackables/{trackable.trackable_id}"
      on:click|preventDefault={showDetails}
    >
      <TrackableButtonLabel {trackable} {items} />
    </a>
  {/if}
  {#if canAddNew}
    <form
      class="element w-12 rounded-r-full border-l {innerBorderColor}"
      method="POST"
      action="/api/items"
      use:submit={{ onSubmit: newItemSubmit, onResponse: newItemResponse }}
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

{#if detailsPopupOpen}
  <div class="fixed top-0 inset-x-0" on:click={() => (detailsPopupOpen = false)}>
    Details for {JSON.stringify(trackable)}
  </div>
{/if}

<style>
  .element {
    background-color: var(--normal-bg-color);
  }

  .element:hover {
    background-color: var(--hover-bg-color);
    color: var(--hover-text-color);
  }
</style>
