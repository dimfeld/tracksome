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

  export const load: Load = async ({ fetch, url, params, stuff }) => {
    try {
      let { trackable_id } = params;
      let items = await handleJsonResponse(fetch(itemUrl(url, trackable_id)));

      return {
        props: {
          trackable: stuff.trackable,
          attributes: stuff.attributes,
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
  import { Trackable, colorVars, TrackableAttribute } from '$lib/trackable';
  import { Item, newItemSubmit, newItemResponse } from '$lib/items';
  import { formatInTimeZone } from 'date-fns-tz';
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
    dateOrToday,
    dateRange,
    formatAsDate,
  } from '$lib/dates';
  import { updateQueryString } from '$lib/query_string_store';
  import { goto } from '$app/navigation';
  import sorter from 'sorters';
  import { browser } from '$app/env';
  import Card from '$lib/components/Card.svelte';

  export let trackable: Trackable;
  export let attributes: TrackableAttribute[];
  export let items: Item[];

  let granularitySelect: HTMLSelectElement;
  function updateGranularity(e: Event) {
    let newGranularity = granularitySelect?.value;
    if (newGranularity !== currentGranularity) {
      goto(updateQueryString($page.url, { granularity: newGranularity }).toString(), {
        noscroll: true,
        keepfocus: true,
      });
    }
  }

  $: timezone = currentTimezone($session);
  $: currentDate = dateOrToday($page.url.searchParams.get('date'), timezone);
  $: currentGranularity = ($page.url.searchParams.get('granularity') as DateGranularity) || 'day';
  $: prevDate = formatAsDate(addGranularity(currentDate, currentGranularity, -1));
  $: nextDate = formatAsDate(addGranularity(currentDate, currentGranularity, 1));

  $: currentDateRange = dateRange(currentDate, currentGranularity);
  $: startDateLabel = formatAsDate(currentDateRange.start);
  $: endDateLabel = formatAsDate(currentDateRange.end);

  $: canAddNew = trackable.multiple_per_day || !items.length;

  if (browser && !$page.url.search) {
    let prevSearch = localStorage.getItem('trackable_view');
    if (prevSearch) {
      let withQs = new URL($page.url);
      withQs.search = prevSearch;
      goto(withQs.toString(), {
        replaceState: true,
        noscroll: true,
        keepfocus: true,
      });
    }
  }

  $: if (browser) localStorage.setItem('trackable_view', $page.url.search);
</script>

<section class="p-2 mx-auto w-full sm:max-w-lg">
  <h1 class="px-8 py-2 w-full text-xl text-center relative">
    {trackable.name}
    <a href={$page.url.pathname + '/edit'}>
      <Button class="absolute right-0" title="Edit" type="button" useTrackableColors iconButton>
        <Icon icon={pencilSolid} />
      </Button>
    </a>
  </h1>

  <div
    class="grid grid-cols-1 grid-rows-1 place-items-center font-medium text-dgray-600 text-center"
  >
    <div class="g11">
      <a sveltekit:prefetch href={updateQueryString($page.url, { date: prevDate }).toString()}
        >&lt;</a
      >
      {#if startDateLabel == endDateLabel}
        {startDateLabel}
      {:else}
        {startDateLabel} &mdash; {endDateLabel}
      {/if}
      <a sveltekit:prefetch href={updateQueryString($page.url, { date: nextDate }).toString()}
        >&gt;</a
      >
    </div>

    <form
      class="g11 justify-self-end"
      method="get"
      action={updateQueryString($page.url, { granularity: null }).toString()}
      on:submit|preventDefault={updateGranularity}
    >
      <select
        bind:this={granularitySelect}
        name="granularity"
        value={currentGranularity}
        on:change={updateGranularity}
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="7d">7 days</option>
        <option value="30d">30 days</option>
      </select>
    </form>
  </div>

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
    {#each items
      .slice()
      .sort(sorter({ value: (i) => i.time, descending: true })) as item (item.item_id)}
      <li>
        <Card>
          <form action={`/api/items/${item.item_id}?_method=PATCH`} method="POST" use:submit>
            <p class="flex justify-between space-x-2">
              <span>{formatInTimeZone(item.time, item.timezone, 'yyyy-MM-dd')}</span>
              <span>{formatInTimeZone(item.time, item.timezone, 'h:mm:ss a')}</span>
            </p>
            <Labelled class="mt-2" label="Note">
              <input class="w-full" type="text" name="note" bind:value={item.note} />
            </Labelled>
            {#each attributes as attribute (attribute.trackable_attribute_id)}
              <Labelled class="mt-2" label={attribute.name}>
                {#if attribute.attribute_type === 'number'}
                  <input
                    class="w-full"
                    type="number"
                    min={attribute.constraints?.min}
                    max={attribute.constraints?.max}
                    name="attribute.{attribute.trackable_attribute_id}"
                    bind:value={item.attributes[attribute.trackable_attribute_id]}
                  />
                {:else if attribute.attribute_type === 'text'}
                  <input
                    class="w-full"
                    type="text"
                    name="attribute.{attribute.trackable_attribute_id}"
                    bind:value={item.attributes[attribute.trackable_attribute_id]}
                  />
                {/if}
              </Labelled>
            {/each}
          </form>
        </Card>
      </li>
    {:else}
      <li>No items recorded in this period</li>
    {/each}
  </ul>
</section>

<style>
  input:focus {
    border-color: var(--trackable-text-color) !important;
    --tw-shadow: var(--trackable-text-color) !important;
    --tw-ring-color: var(--trackable-text-color) !important;
  }

  .g11 {
    grid-row: 1;
    grid-column: 1;
  }
</style>
