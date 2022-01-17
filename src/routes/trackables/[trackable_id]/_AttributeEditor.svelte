<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Checkbox from '$lib/components/Checkbox.svelte';

  import Labelled from '$lib/components/Labelled.svelte';
  import { submit } from '$lib/form';
  import { Trackable, TrackableAttribute } from '$lib/trackable';

  export let trackable: Trackable;
  export let attribute: TrackableAttribute;

  function onResponse() {
    invalidate(`/api/trackables/${trackable.trackable_id}/attributes`);
  }

  $: baseUrl = `/api/trackables/${trackable.trackable_id}/attributes`;
  $: action =
    attribute.trackable_attribute_id >= 0
      ? `${baseUrl}/${attribute.trackable_attribute_id}?_method=PATCH`
      : baseUrl;
</script>

<form
  class="flex flex-col items-stretch space-y-4"
  {action}
  method="POST"
  use:submit={{ onResponse }}
>
  <input type="hidden" name="sort" value={attribute.sort} />
  <div class="flex space-x-4">
    <Labelled label="Name" class="flex-1">
      <input type="text" class="w-full" name="name" required bind:value={attribute.name} />
    </Labelled>

    <Labelled label="Type">
      <select name="attribute_type" bind:value={attribute.attribute_type}>
        <option value="number">Number</option>
        <option value="text">Text</option>
        <!-- <option value="category">Category</option> -->
      </select>
    </Labelled>
  </div>

  {#if attribute.attribute_type === 'number'}
    <div class="w-full flex space-x-4 justify-between">
      <Labelled label="Min" class="flex-1">
        <input
          type="number"
          class="w-full"
          name="constraints.min"
          bind:value={attribute.constraints.min}
          placeholder="Optional"
        />
      </Labelled>
      <Labelled label="Max" class="flex-1">
        <input
          type="number"
          class="w-full"
          name="constraints.max"
          bind:value={attribute.constraints.max}
          placeholder="Optional"
        />
      </Labelled>
    </div>
  {/if}

  <div class="flex justify-between items-center space-x-4">
    <Checkbox name="enabled" bind:value={attribute.enabled} label="Enabled" />
    <Button type="submit" class="self-end" useTrackableColors>Save</Button>
  </div>
</form>
