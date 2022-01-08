<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ fetch }) => {
    let [trackables, items] = await Promise.all([
      fetch('/api/trackables').then((r) => r.json()),
      fetch(todayItemsUrl).then((r) => r.json()),
    ]);

    return {
      props: {
        trackables,
        items,
      },
    };
  };
</script>

<script lang="ts">
  import { session } from '$app/stores';
  import Switch from '$lib/components/Switch.svelte';
  import TrackableButton from '$lib/components/TrackableButton.svelte';
  import { Trackable } from '$lib/trackable';
  import { Item, todayItemsUrl } from '$lib/items';
  import { submit } from '$lib/form';
  import sorter from 'sorters';
  import { appContext } from '$lib/context';
  import { randomColor } from '$lib/colors';
  import Button from '$lib/components/Button.svelte';
  import groupBy from 'just-group-by';
  import { invalidate } from '$app/navigation';

  export let trackables: Trackable[];
  export let items: Item[];

  let { loading, toasts } = appContext();

  function onSubmit(data: FormData | null) {
    if (!data || !data.get('name')) {
      return false;
    }

    loading.add('newTrackable');
  }

  async function onResponse(res: Response) {
    loading.delete('newTrackable');

    if (res.ok) {
      invalidate(todayItemsUrl);
      $session.randomColor = randomColor();
    } else {
      $toasts.error(await res.text());
    }
  }

  $: itemsByTrackable = groupBy(items, (item) => item.trackable_id);
  $: trackableRows = trackables
    .sort(
      sorter(
        (t) => t.sort,
        (t) => t.name
      )
    )
    .map((trackable) => {
      return {
        trackable,
        items: itemsByTrackable[trackable.trackable_id] ?? [],
      };
    });

  $: maxSort = trackableRows[trackableRows.length - 1]?.trackable.sort ?? 0;

  $: newItemColor = $session.randomColor;
</script>

<ul class="p-2 w-full mx-auto max-w-md space-y-4">
  {#each trackableRows as { trackable, items } (trackable.trackable_id)}
    <li>
      <TrackableButton {trackable} {items} />
    </li>
  {/each}
</ul>

<form
  class="p-2 mt-4 w-full mx-auto max-w-md"
  method="POST"
  action="/api/trackables"
  use:submit={{ onSubmit, onResponse }}
>
  <h2 class="font-medium text-dgray-600">New Trackable</h2>
  <input name="sort" type="hidden" value={maxSort + 1} />
  <p class="mt-2">
    <input class="w-full" name="name" autocomplete="off" type="text" placeholder="Name" />
  </p>
  <p class="mt-2 flex justify-between items-center">
    <input name="color" type="color" class="inline h-8 bg-transparent" value={newItemColor} />
    <Switch name="multiple_per_day" value={false}>Multiple Per Day</Switch>
    <Button type="submit" style="primary">Add</Button>
  </p>
</form>
