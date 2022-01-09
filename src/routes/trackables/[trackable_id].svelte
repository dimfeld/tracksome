<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { handleJsonResponse, ResponseError } from '$lib/load';

  export const load: Load = async ({ fetch, params }) => {
    try {
      let { trackable_id } = params;

      let [trackable, items] = await Promise.all([
        handleJsonResponse(fetch(`/api/trackables/${trackable_id}`)),
        handleJsonResponse(
          fetch(`/api/items?trackableId=${trackable_id}&startDate=today&endDate=today`)
        ),
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
  import { Trackable } from '$lib/trackable';
  import { Item } from '$lib/items';
  import { contrastingColor } from '$lib/colors';
  import { formatInTimeZone } from 'date-fns-tz';
  import { session } from '$app/stores';
  import { currentTimezone } from '$lib/dates';
  import * as d3 from 'd3';

  export let trackable: Trackable;
  export let items: Item[];

  $: colors = contrastingColor(d3.lab(trackable.color));

  $: timezone = currentTimezone($session);
  $: itemRows = items.map((item) => {
    return {
      ...item,
      timeLabel: formatInTimeZone(item.time, timezone, 'yyyy-MM-dd HH:mm:ss'),
    };
  });
</script>

<section class="p-2 mx-auto max-w-md">
  <h1
    class="px-3 py-2 w-full text-lg text-center"
    style="color:{colors.textColor};background-color:{trackable.color}"
  >
    {trackable.name}
  </h1>
  <ul class="mt-2">
    {#each itemRows as item (item.item_id)}
      <li>Recorded at {item.timeLabel}</li>
    {:else}
      <li>No items recorded today</li>
    {/each}
  </ul>
</section>
