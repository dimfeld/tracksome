<script lang="ts">
  import { Item } from '$lib/items';
  import { Trackable } from '$lib/trackable';

  export let trackable: Trackable;
  export let items: Item[];
</script>

<span class="w-4 ml-4 text-center mr-auto opacity-60"
  >{#if items.length}
    {#if trackable.multiple_per_day}
      {items.length}
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    {/if}
  {/if}</span
>
<span class="flex-1 ml-4 text-center truncate">
  {trackable.name}
</span>
