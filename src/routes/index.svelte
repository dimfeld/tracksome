<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ fetch }) => {
    let [trackables, counts] = await Promise.all([
      fetch('/api/trackables').then((r) => r.json()),
      fetch('/api/items?startDate=today&endDate=today').then((r) => r.json()),
    ]);

    return {
      props: {
        trackables,
        counts,
      },
    };
  };
</script>

<script lang="ts">
  import { session } from '$app/stores';
  import Switch from '$lib/components/Switch.svelte';
  import TrackableButton from '$lib/components/TrackableButton.svelte';
  import { Trackable } from '$lib/trackable';
  import { Item } from '$lib/items';
  import { submit } from '$lib/form';
  import sorter from 'sorters';
  import { appContext } from '$lib/context';
  import { randomColor } from '$lib/colors';
  import Button from '$lib/components/Button.svelte';

  export let trackables: Trackable[];
  export let counts: Item[];

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
      let result = await res.json();
      trackables = [...trackables, result];

      $session.randomColor = randomColor();
    } else {
      $toasts.error(await res.text());
    }
  }

  $: trackables = trackables.sort(
    sorter(
      (t) => t.sort,
      (t) => t.name
    )
  );

  $: maxSort = trackables[trackables.length - 1]?.sort ?? 0;

  $: newItemColor = $session.randomColor;
</script>

<ul class="p-2 w-full mx-auto max-w-md space-y-4">
  {#each trackables as trackable (trackable.trackable_id)}
    <li>
      <TrackableButton {trackable} plus={trackable.multiple_per_day} />
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
