<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { handleJsonResponse, ResponseError } from '$lib/load';

  function itemUrl(trackable_id: string) {
    return `/api/items?trackableId=${trackable_id}&startDate=today&endDate=today`;
  }

  export const load: Load = async ({ fetch, params }) => {
    try {
      let { trackable_id } = params;

      let [trackable, items] = await Promise.all([
        handleJsonResponse(fetch(`/api/trackables/${trackable_id}`)),
        handleJsonResponse(fetch(itemUrl(trackable_id))),
      ]);

      return {
        props: {
          trackable,
          items,
        },
      };
    } catch (e) {
      if (e instanceof ResponseError) {
        return e.toResponse();
      }

      throw e;
    }
  };
</script>

<script lang="ts">
  import { Trackable, colorVars } from '$lib/trackable';
  import { Item, newItemSubmit, newItemResponse } from '$lib/items';
  import { contrastingColor } from '$lib/colors';
  import { formatInTimeZone } from 'date-fns-tz';
  import { session } from '$app/stores';
  import { currentTimezone } from '$lib/dates';
  import * as d3 from 'd3';
  import { submit } from '$lib/form';
  import Button from '$lib/components/Button.svelte';
  import Labelled from '$lib/components/Labelled.svelte';

  export let trackable: Trackable;
  export let items: Item[];

  $: itemRows = items.map((item) => {
    let date = formatInTimeZone(item.time, item.timezone, 'yyyy-MM-dd');
    let time = formatInTimeZone(item.time, item.timezone, 'h:mm:ss a');

    return {
      item,
      date,
      time,
      updateApiPath: `/api/items/${item.item_id}?_method=PATCH`,
    };
  });

  $: canAddNew = trackable.multiple_per_day || !items.length;

  $: trackableColors = colorVars(d3.lab(trackable.color));
</script>

<section class="p-2 mx-auto w-full sm:max-w-lg" style={trackableColors}>
  <h1 class="px-3 py-2 w-full text-xl text-center">
    {trackable.name}
  </h1>

  {#if canAddNew}
    <form
      method="POST"
      action="/api/items"
      class="mt-4"
      use:submit={{
        onSubmit: (data) => newItemSubmit(data, canAddNew),
        onResponse: newItemResponse,
      }}
    >
      <input type="hidden" name="trackable_id" value={trackable.trackable_id} />
      <Button class="w-full" style="none" useTrackableColors={true} type="submit">Add One</Button>
    </form>
  {/if}

  <ul class="mt-4 space-y-4">
    {#each itemRows as { item, ...i } (item.item_id)}
      <li class="flex flex-col space-y-2 shadow-lg border border-dgray-800 rounded-lg p-2">
        <form action={i.updateApiPath} method="POST" use:submit>
          <p class="flex justify-between space-x-2">
            <span>{i.date}</span>
            <span>{i.time}</span>
          </p>
          <Labelled label="Note">
            <input class="w-full" type="text" name="note" bind:value={item.note} />
          </Labelled>
        </form>
      </li>
    {:else}
      <li>No items recorded today</li>
    {/each}
  </ul>
</section>

<style>
  li {
    border-color: var(--trackable-bg-color);
  }
</style>
