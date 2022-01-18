<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ stuff }) => {
    return {
      props: {
        trackable: stuff.trackable,
        attributes: stuff.attributes,
      },
    };
  };
</script>

<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { submit } from '$lib/form';
  import { blankAttribute, Trackable, TrackableAttribute } from '$lib/trackable';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import Labelled from '$lib/components/Labelled.svelte';
  import sorter from 'sorters';
  import AttributeEditor from './_AttributeEditor.svelte';
  import Checkbox from '$lib/components/Checkbox.svelte';

  export let trackable: Trackable;
  export let attributes: TrackableAttribute[];

  $: attributes.sort(
    sorter(
      (a) => a.sort,
      (a) => a.trackable_attribute_id
    )
  );

  function onResponse() {
    invalidate(`/api/trackables/${trackable.trackable_id}`);
  }

  $: updateTrackablePath = `/api/trackables/${trackable.trackable_id}`;
  $: maxSort = attributes[attributes.length - 1]?.sort ?? 1;
</script>

<div class="p-2 max-w-lg w-full mx-auto flex flex-col space-y-4">
  <div class="flex justify-between">
    <h1 class="text-lg font-medium">Editing {trackable.name}</h1>
    <a href="."><Button>Back</Button></a>
  </div>

  <Card label="Trackable Properties">
    <form
      action="{updateTrackablePath}?_method=PATCH"
      method="POST"
      use:submit={{ onResponse }}
      class="flex flex-col space-y-4"
    >
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

      <div class="flex justify-between space-x-4">
        <Checkbox
          name="multiple_per_day"
          bind:value={trackable.multiple_per_day}
          label="Allow Multiple Per Day"
        />

        <Button type="submit" useTrackableColors>Save</Button>
      </div>
    </form>
  </Card>

  {#each attributes as attribute (attribute.trackable_attribute_id)}
    <Card>
      <span slot="label"
        ><span class="font-normal text-dgray-800">Edit Attribute</span> {attribute.name}</span
      >
      <AttributeEditor {trackable} {attribute} />
    </Card>
  {/each}

  <Card label="Add a New Attribute">
    <AttributeEditor {trackable} attribute={blankAttribute(maxSort + 1)} />
  </Card>
</div>
