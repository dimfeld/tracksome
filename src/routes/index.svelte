<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { handleJsonResponse, ResponseError } from '$lib/load';

  export const load: Load = async ({ fetch }) => {
    try {
      let [trackables, items] = await Promise.all([
        handleJsonResponse(fetch('/api/trackables')),
        handleJsonResponse(fetch(todayItemsUrl)),
      ]);

      return {
        props: {
          trackables,
          items,
        },
      };
    } catch (e) {
      if (e instanceof ResponseError) {
        return e.toResponse();
      } else {
        throw e;
      }
    }
  };
</script>

<script lang="ts">
  import { page, session } from '$app/stores';
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
  import { updateQueryString } from '$lib/query_string_store';
  import { cubicOut } from 'svelte/easing';
  import Icon from '$lib/components/Icon.svelte';
  import { chevronDownSolid, chevronUpSolid } from '$lib/components/icons';
  import type { SlideParams } from 'svelte/types/runtime/transition';

  export let trackables: Trackable[];
  export let items: Item[];

  let { loading, toasts } = appContext();

  function onSubmit(data: FormData | null) {
    if (!data || !data.get('name')) {
      return false;
    }

    loading.add('newTrackable');
  }

  async function onResponse(res: Response, form: HTMLFormElement) {
    loading.delete('newTrackable');

    if (res.ok) {
      invalidate('/api/trackables');
      form.reset();
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

  $: editMode = $page.url.searchParams.get('edit') == 'true';

  function slideHorizontal(node: Element, { delay = 0, duration = 300, easing = cubicOut } = {}) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const width = parseFloat(style.width);
    const padding_left = parseFloat(style.paddingLeft);
    const padding_right = parseFloat(style.paddingRight);
    const margin_left = parseFloat(style.marginLeft);
    const margin_right = parseFloat(style.marginRight);
    const border_left_width = parseFloat(style.borderLeftWidth);
    const border_right_width = parseFloat(style.borderRightWidth);
    return {
      delay,
      duration,
      easing,
      css: (t: number) =>
        'overflow: hidden;' +
        `opacity: ${Math.min(t * 20, 1) * opacity};` +
        `width: ${t * width}px;` +
        `padding-left: ${t * padding_left}px;` +
        `padding-right: ${t * padding_right}px;` +
        `margin-left: ${t * margin_left}px;` +
        `margin-right: ${t * margin_right}px;` +
        `border-left-width: ${t * border_left_width}px;` +
        `border-right-width: ${t * border_right_width}px;`,
    };
  }
</script>

{#if editMode}
  <form
    class="hidden"
    id="reorder-form"
    method="POST"
    action="/api/trackables/reorder"
    use:submit={{ onResponse: () => invalidate('/api/trackables') }}
  >
    {#each trackableRows as { trackable } (trackable.trackable_id)}
      <input type="hidden" name="trackable.{trackable.trackable_id}" value={trackable.sort} />
    {/each}
  </form>
{/if}

<section class="max-w-md mx-auto p-2">
  <ul class="w-full space-y-4">
    {#each trackableRows as { trackable, items }, index (trackable.trackable_id)}
      <li class="flex items-center">
        {#if editMode}
          <div class="flex mr-2" transition:slideHorizontal|local>
            <Button
              class="rounded-r-none"
              type="submit"
              form="reorder-form"
              formaction="/api/trackables/{trackable.trackable_id}/move_up"
              title="Move {trackable.name} Up"
              disabled={index === 0}
              iconButton><Icon icon={chevronUpSolid} /></Button
            >
            <Button
              class="rounded-l-none -ml-px"
              type="submit"
              form="reorder-form"
              formaction="/api/trackables/{trackable.trackable_id}/move_down"
              title="Move {trackable.name} Down"
              disabled={index === trackableRows.length - 1}
              iconButton><Icon icon={chevronDownSolid} /></Button
            >
          </div>
        {/if}
        <TrackableButton {trackable} {items} />
      </li>
    {/each}
  </ul>

  <form
    class="mt-4 w-full"
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

  <a href={updateQueryString($page.url, { edit: editMode ? null : true }).toString()}
    ><Button class="mt-4 w-40">
      {#if editMode}
        Done Editing
      {:else}
        Edit Sort Order
      {/if}
    </Button></a
  >
</section>
