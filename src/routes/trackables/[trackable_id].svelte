<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { handleJsonResponse, ResponseError } from '$lib/load';

  function itemUrl(url: URL, trackable_id: string | number) {
    let output = new URL('/api/items', url);
    output.searchParams.set('trackableId', trackable_id.toString());
    output.searchParams.set('date', url.searchParams.get('date') || 'today');
    output.searchParams.set('granularity', url.searchParams.get('granularity') || 'day');

    return output.toString();
  }

  export const load: Load = async ({ fetch, url, params }) => {
    try {
      let { trackable_id } = params;

      let [trackable, items] = await Promise.all([
        handleJsonResponse(fetch(`/api/trackables/${trackable_id}`)),
        handleJsonResponse(fetch(itemUrl(url, trackable_id))),
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
  import { formatInTimeZone } from 'date-fns-tz';
  import * as d3 from 'd3';
  import { page, session } from '$app/stores';
  import { submit } from '$lib/form';
  import Button from '$lib/components/Button.svelte';
  import Labelled from '$lib/components/Labelled.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { pencilSolid } from '$lib/components/icons';
  import {
    addGranularity,
    currentTimezone,
    DateGranularity,
    dateInUserTimezone,
    dateOrToday,
    dateRange,
    formatAsDate,
  } from '$lib/dates';
  import { updateQueryString } from '$lib/query_string_store';
  import { goto } from '$app/navigation';

  export let trackable: Trackable;
  export let items: Item[];

  function onUpdateTrackableResponse(res: Response) {
    if (res.ok) {
      goto(updateQueryString($page.url, { edit: null }).toString());
    }
  }

  $: edit = $page.url.searchParams.get('edit') == 'true';
  $: timezone = currentTimezone($session);
  $: currentDate = dateOrToday($page.url.searchParams.get('date'), timezone);
  $: currentGranularity = ($page.url.searchParams.get('granularity') as DateGranularity) || 'day';
  $: prevDate = formatAsDate(addGranularity(currentDate, currentGranularity, -1));
  $: nextDate = formatAsDate(addGranularity(currentDate, currentGranularity, 1));

  $: currentDateRange = dateRange(currentDate, currentGranularity);
  $: startDateLabel = formatAsDate(currentDateRange.start);
  $: endDateLabel = formatAsDate(currentDateRange.end);

  $: canAddNew = trackable.multiple_per_day || !items.length;

  $: trackableColors = colorVars(d3.lab(trackable.color));
  $: updateTrackablePath = `/api/trackables/${trackable.trackable_id}?_method=PATCH`;
</script>

<section class="p-2 mx-auto w-full sm:max-w-lg" style={trackableColors}>
  <h1 class="px-8 py-2 w-full text-xl text-center relative">
    {trackable.name}
    {#if !edit}
      <a href={updateQueryString($page.url, { edit: true }).toString()}>
        <Button class="absolute right-0" title="Edit" type="button" useTrackableColors iconButton>
          <Icon icon={pencilSolid} />
        </Button>
      </a>
    {/if}
  </h1>

  <p class="font-medium text-dgray-600 text-center">
    <a sveltekit:prefetch href={updateQueryString($page.url, { date: prevDate }).toString()}>&lt;</a
    >
    {#if startDateLabel == endDateLabel}
      {startDateLabel}
    {:else}
      {startDateLabel} &mdash; {endDateLabel}
    {/if}
    <a sveltekit:prefetch href={updateQueryString($page.url, { date: nextDate }).toString()}>&gt;</a
    >
  </p>

  {#if edit}
    <form
      action={updateTrackablePath}
      method="POST"
      use:submit={{ onResponse: onUpdateTrackableResponse }}
      class="flex flex-col space-y-4 card shadow-lg border rounded-lg p-2"
    >
      <h2 class="text-lg font-medium">Editing</h2>

      <div class="flex items-center space-x-4">
        <Labelled class="flex-1" label="Name">
          <input name="name" type="text" bind:value={trackable.name} class="w-full" />
        </Labelled>
        <Labelled label="Color">
          <input
            type="color"
            name="color"
            class="h-10 bg-transparent"
            bind:value={trackable.color}
          />
        </Labelled>
      </div>

      <div class="flex justify-end space-x-2">
        <a href={updateQueryString($page.url, { edit: null }).toString()}><Button>Cancel</Button></a
        >
        <Button type="submit" useTrackableColors={true}>Save</Button>
      </div>
    </form>
  {/if}

  {#if canAddNew}
    <form
      method="POST"
      action="/api/items"
      class="mt-4"
      use:submit={{
        onSubmit: (data) => newItemSubmit(data, canAddNew),
        onResponse: (r) => newItemResponse(r, itemUrl($page.url, trackable.trackable_id)),
      }}
    >
      <input type="hidden" name="trackable_id" value={trackable.trackable_id} />
      <Button class="w-full" style="none" useTrackableColors={true} type="submit">Add One</Button>
    </form>
  {/if}

  <ul class="mt-4 space-y-4">
    {#each items as item (item.item_id)}
      <li class="flex flex-col space-y-2 card shadow-lg border rounded-lg p-2">
        <form action={`/api/items/${item.item_id}?_method=PATCH`} method="POST" use:submit>
          <p class="flex justify-between space-x-2">
            <span>{formatInTimeZone(item.time, item.timezone, 'yyyy-MM-dd')}</span>
            <span>{formatInTimeZone(item.time, item.timezone, 'h:mm:ss a')}</span>
          </p>
          <Labelled class="mt-2" label="Note">
            <input class="w-full" type="text" name="note" bind:value={item.note} />
          </Labelled>
        </form>
      </li>
    {:else}
      <li>No items recorded in this period</li>
    {/each}
  </ul>
</section>

<style>
  li,
  .card {
    border-color: var(--trackable-text-color);
  }

  input:focus {
    border-color: var(--trackable-text-color) !important;
    --tw-shadow: var(--trackable-text-color) !important;
    --tw-ring-color: var(--trackable-text-color) !important;
  }
</style>
