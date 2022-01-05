<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = ({ fetch }) => {
    let trackables = fetch('/trackables').then((r) => r.json());
    return {
      props: { trackables },
    };
  };
</script>

<script lang="ts">
  import TrackableButton from '$lib/components/TrackableButton.svelte';
  import { Trackable } from '$lib/trackable';
  import { submit } from '$lib/actions';
  import sorter from 'sorters';

  export let trackables: Trackable[];

  let updating = false;
  function onSubmit() {
    updating = true;
  }

  async function onResponse(res: Response) {
    updating = false;

    let result = await res.json();
    trackables = [...trackables, result];
  }

  $: trackables.sort(
    sorter(
      (t) => t.sort,
      (t) => t.name
    )
  );
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

<form method="POST" action="/trackables" use:submit={{ onSubmit, onResponse }}>
  <input id="new-item-name" autocomplete="off" type="text" placeholder="New Trackable" />
</form>
