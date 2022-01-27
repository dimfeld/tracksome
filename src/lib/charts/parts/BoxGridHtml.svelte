<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';

  type Data = $$Generic;

  const { x, z, zGet, data } = getContext('LayerCake');

  const dispatch = createEventDispatcher();

  export let orientation: 'horz' | 'vert' = 'vert';
  export let mainSize: number | 'auto' = 'auto';
  export let crossSize = 7;
  export let gap = 0.125;
  export let placeholder = (box: Data) => false;

  $: crossSizeProp = orientation === 'vert' ? 'grid-template-rows' : 'grid-template-columns';
  $: mainSizeProp = orientation === 'vert' ? 'grid-template-columns' : 'grid-template-rows';
  $: crossSizeValue = typeof crossSize === 'number' ? `repeat(${crossSize}, 1fr)` : crossSize;
  $: mainSizeValue = typeof mainSize === 'number' ? `repeat(${mainSize}, 1fr)` : mainSize;

  $: boxList =
    typeof mainSize === 'number' && typeof crossSize === 'number'
      ? $data.slice(0, mainSize * crossSize)
      : $data;
</script>

<div
  class="grid"
  class:grid-flow-col={orientation === 'vert'}
  style="{crossSizeProp}:{crossSizeValue};{mainSizeProp}:{mainSizeValue};grid-gap:{gap}rem"
  on:mouseout={(e) => dispatch('mouseout')}
  on:blur={(e) => dispatch('mouseout')}
>
  {#each boxList as box}
    {#if placeholder(box)}
      <div class="h-4 w-4" />
    {:else}
      <div
        class="h-4 w-4 border-dgray-200 border hover:border-dblack"
        style:background-color={$zGet(box)}
        on:mouseenter={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
        on:mousemove={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
        on:focus={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
      />
    {/if}
  {/each}
</div>
