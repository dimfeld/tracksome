<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';

  const { x, z, zGet, data } = getContext('LayerCake');

  const dispatch = createEventDispatcher();

  export let orientation: 'horz' | 'vert' = 'horz';
  export let mainSize: number | 'auto' = 'auto';
  export let crossSize = 4;
  export let gap = 0.25;

  $: crossSizeProp = orientation === 'horz' ? 'grid-template-rows' : 'grid-template-columns';
  $: mainSizeProp = orientation === 'horz' ? 'grid-template-columns' : 'grid-template-rows';
  $: crossSizeValue = typeof crossSize === 'number' ? `repeat(${crossSize}, 1fr)` : crossSize;
  $: mainSizeValue = typeof mainSize === 'number' ? `repeat(${mainSize}, 1fr)` : mainSize;

  $: boxList =
    typeof mainSize === 'number' && typeof crossSize === 'number'
      ? $data.slice(0, mainSize * crossSize)
      : $data;
</script>

<div
  class="grid"
  style="{crossSizeProp}:{crossSizeValue};{mainSizeProp}:{mainSizeValue};grid-gap:{gap}rem"
  on:mouseout={(e) => dispatch('mouseout')}
  on:blur={(e) => dispatch('mouseout')}
>
  {#each boxList as box}
    <div
      class="h-4 w-4 border border-dgray-200 hover:border-black"
      style:background-color={$zGet(box)}
      on:mouseenter={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
      on:mousemove={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
      on:focus={(e) => dispatch('mousemove', { e, data: box, score: $z(box) })}
    />
  {/each}
</div>
