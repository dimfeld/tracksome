<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import Checkbox from '$lib/components/Checkbox.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { xSolid } from '$lib/components/icons';

  import Labelled from '$lib/components/Labelled.svelte';
  import { submit } from '$lib/form';
  import { Trackable, TrackableAttribute } from '$lib/trackable';

  export let trackable: Trackable;
  export let attribute: TrackableAttribute;

  function onResponse() {
    invalidate(`/api/trackables/${trackable.trackable_id}/attributes`);
  }

  $: isNew = attribute.trackable_attribute_id < 0;
  $: baseUrl = `/api/trackables/${trackable.trackable_id}/attributes`;
  $: action = isNew ? baseUrl : `${baseUrl}/${attribute.trackable_attribute_id}?_method=PATCH`;

  $: maxCategorySort =
    'categories' in attribute
      ? Object.values(attribute.categories).reduce((acc, x) => Math.max(acc, x.sort), 0)
      : 0;
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
        <option value="category">Category</option>
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

{#if attribute.attribute_type === 'category' && !isNew}
  <Labelled label="Categories" class="mt-6">
    <ul class="w-full flex flex-col space-y-2 pt-4">
      {#each Object.entries(attribute.categories || []) as [category_id, category] (category_id)}
        {@const action = `${baseUrl}/${attribute.trackable_attribute_id}/categories/${category_id}`}
        <li class="flex space-x-2 items-stretch">
          <form
            class="w-full flex space-x-2"
            action="{action}?_method=PATCH"
            method="POST"
            use:submit={{ onResponse }}
          >
            <label class="flex-1">
              <input type="text" class="w-full" name="name" value={category.name} />
              <span class="sr-only">Category Name</span>
            </label>
            <input type="color" name="color" value={category.color} class="bg-transparent h-10" />
            <Button
              type="submit"
              formaction="{action}?_method=DELETE"
              class="h-full"
              style="danger"
              title="Delete"
              iconButton><Icon icon={xSolid} /></Button
            >
            <Button type="submit" useTrackableColors>Save</Button>
            <input type="hidden" name="sort" value={category.sort} />
          </form>
        </li>
      {/each}
      <li class="w-full">
        <form
          class="w-full flex space-x-2 items-center"
          action="{baseUrl}/{attribute.trackable_attribute_id}/categories"
          method="POST"
          use:submit={{
            onResponse: (res, form) => {
              if (res.ok) {
                form.reset();
                onResponse();
              }
            },
          }}
        >
          <label class="flex-1">
            <input type="text" class="w-full" placeholder="New Category" name="name" />
            <span class="sr-only">New Category Name</span>
          </label>
          <input type="color" name="color" value="#808080" class="bg-transparent h-10" />
          <Button type="submit" useTrackableColors>Add</Button>
          <input type="hidden" name="sort" value={maxCategorySort + 1} />
        </form>
      </li>
    </ul>
  </Labelled>
{/if}
