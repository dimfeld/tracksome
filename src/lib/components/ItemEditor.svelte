<script lang="ts">
  import { submit } from '$lib/form';
  import { Item } from '$lib/items';
  import { TrackableAttribute } from '$lib/trackable';
  import { formatInTimeZone } from 'date-fns-tz';
  import Labelled from './Labelled.svelte';

  export let item: Item;
  export let attributes: TrackableAttribute[];
</script>

<form action="/api/items/{item.item_id}?_method=PATCH" method="POST" use:submit>
  <input type="hidden" name="timezone" value={item.timezone} />
  <p class="flex justify-between space-x-2">
    <input
      type="date"
      name="date"
      value={formatInTimeZone(item.time, item.timezone, 'yyyy-MM-dd')}
    />
    <input type="time" name="time" value={formatInTimeZone(item.time, item.timezone, 'HH:mm')} />
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
          name="attributes.{attribute.trackable_attribute_id}.numeric_value"
          value={item.attributes[attribute.trackable_attribute_id]?.numeric_value ?? ''}
        />
      {:else if attribute.attribute_type === 'text'}
        <input
          class="w-full"
          type="text"
          name="attributes.{attribute.trackable_attribute_id}.text_value"
          value={item.attributes[attribute.trackable_attribute_id]?.text_value ?? ''}
        />
      {/if}
    </Labelled>
  {/each}
  <input type="submit" class="hidden" />
</form>
