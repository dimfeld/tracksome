<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import * as d3 from 'd3';

  function randomColor() {
    let h = Math.floor(Math.random() * 360);
    let s = 0.3 + Math.random() * 0.7;
    let l = 0.3 + Math.random() * 0.5;

    return d3.hsl(h, s, l).rgb().formatHex();
  }

  export const load: Load = async ({ fetch }) => {
    let trackables = await fetch('/trackables').then((r) => r.json());
    return {
      props: {
        trackables,
        initialNewItemColor: randomColor(),
      },
    };
  };
</script>

<script lang="ts">
  import Switch from '$lib/components/Switch.svelte';
  import TrackableButton from '$lib/components/TrackableButton.svelte';
  import { Trackable } from '$lib/trackable';
  import { submit } from '$lib/actions';
  import sorter from 'sorters';
  import { appContext } from '$lib/context';

  export let trackables: Trackable[];
  export let initialNewItemColor: string;

  let { loading } = appContext();

  function onSubmit() {
    loading.add('newTrackable');
  }

  async function onResponse(res: Response) {
    loading.delete('newTrackable');

    if (res.ok) {
      let result = await res.json();
      trackables = [...trackables, result];

      newItemColor = randomColor();
    }
  }

  $: trackables = trackables.sort(
    sorter(
      (t) => t.sort,
      (t) => t.name
    )
  );

  $: maxSort = trackables[trackables.length - 1]?.sort ?? 0;

  let newItemColor = initialNewItemColor;
</script>

<ul class="p-2">
  {#each trackables as trackable (trackable.trackable_id)}
    <li>
      <TrackableButton
        label={trackable.name}
        color={trackable.color}
        plus={true}
        countable={trackable.multiple_per_day}
      />
    </li>
  {/each}
</ul>

<form
  class="p-2 w-full sm:w-96"
  method="POST"
  action="/trackables"
  use:submit={{ onSubmit, onResponse }}
>
  <input name="sort" type="hidden" value={maxSort + 1} />
  <p>
    <input class="w-full" name="name" autocomplete="off" type="text" placeholder="New Trackable" />
  </p>
  <p class="mt-2 flex justify-between items-center">
    <input name="color" type="color" class="h-8 bg-transparent" value={newItemColor} />
    <Switch name="multiple_per_day" type="checkbox" value={false}>Multiple Per Day</Switch>
    <button type="submit" class="border-dgray-900 border px-3 py-2 rounded-md">Add</button>
  </p>
</form>
