<script lang="ts">
  import { submit } from '$lib/form';
  import { Item } from '$lib/items';
  import { Trackable } from '$lib/trackable';
  import Labelled from '$lib/components/Labelled.svelte';

  export let trackable: Trackable;
  export let item: Item;
</script>

<form action="/api/items/{item.item_id}?_method=PUT" method="POST" use:submit>
  <h2>{trackable.name}</h2>
  <p>{item.date}</p>
  <Labelled label="Note">
    <input type="text" name="note" bind:value={item.note} />
  </Labelled>
</form>

<!-- TODO loop over attributes to edit and update them -->
