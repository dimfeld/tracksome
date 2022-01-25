<script lang="ts">
  import { getContext } from 'svelte';

  const { x, z, zGet, data } = getContext('LayerCake');

  export let orientation: 'horz' | 'vert' = 'horz';
  export let mainSize: number | 'auto' = 'auto';
  export let crossSize = 4;
  export let gap = 0;

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
>
  {#each boxList as box}
    <div style:background-color={$zGet(box)}>
      {$z(box)}
    </div>
  {/each}
</div>
