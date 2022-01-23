<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { contrastingColor } from '$lib/colors';
  import { submit } from '$lib/form';
  import * as d3 from 'd3';
  import { goto, invalidate } from '$app/navigation';
  import { Trackable, colorVars, trackableUrl } from '$lib/trackable';
  import { desktopScreen } from '$lib/styles';
  import { Item, newItemSubmit, newItemResponse } from '$lib/items';
  import TrackableButtonLabel from './_TrackableButtonLabel.svelte';
  import { showTippy } from '$lib/tippy';
  import { session, page } from '$app/stores';
  import Form from './Form.svelte';

  export let trackable: Trackable;
  export let items: Item[];

  const dispatch = createEventDispatcher<{ 'click-list': void; 'click-plus': void; click: void }>();

  $: labColor = d3.lab(trackable.color);
  $: innerBorderColor =
    labColor.l < 50 ? 'border-white border-opacity-30' : 'border-black border-opacity-20';
  $: cssVars = colorVars(labColor);

  let detailsPopupOpen = false;

  // USe this once item editing is live.
  // $: plus = trackable.multiple_per_day;

  $: canAddNew = trackable.multiple_per_day || !items.length;

  // When not showing a button, we don't render it and instead expand the center button to include its space. This
  // makes the hover effects look proper.
  $: centerButtonClasses =
    'element py-2 flex-1 truncate' +
    (canAddNew ? 'px-4 rounded-l-full' : 'pl-4 pr-14 rounded-full');
</script>

<div class="flex shadow-current drop-shadow-lg w-full" style={cssVars}>
  <a
    class="{centerButtonClasses} flex w-full"
    href={trackableUrl($session, $page.url, `/trackables/${trackable.trackable_id}`)}
  >
    <TrackableButtonLabel {trackable} {items} />
  </a>
  {#if canAddNew}
    <div class="element flex items-stretch w-12 rounded-r-full border-l {innerBorderColor}">
      <Form
        method="POST"
        action="/api/items"
        onSubmit={(data) => newItemSubmit(data, canAddNew)}
        onResponse={() => newItemResponse()}
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
      </Form>
    </div>
  {/if}
</div>

{#if detailsPopupOpen}
  <div use:showTippy={{ position: 'auto', close: () => (detailsPopupOpen = false) }}>
    Details for {JSON.stringify(trackable)}
  </div>
{/if}

<style>
  .element {
    background-color: var(--trackable-bg-color);
    color: var(--trackable-text-color);
  }

  .element:hover {
    background-color: var(--trackable-hover-bg-color);
    color: var(--trackable-hover-text-color);
  }
</style>
