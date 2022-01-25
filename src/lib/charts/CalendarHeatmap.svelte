<script lang="ts">
  import { Item } from '$lib/items';
  import { Html, LayerCake, ScaledSvg } from 'layercake';
  import { format as formatDate, startOfDay, subDays } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';
  import { group, range, scaleQuantize } from 'd3';
  import BoxGridHtml from './parts/BoxGridHtml.svelte';

  export let data: Item[];
  export let weeks = 4;
  export let orientation: 'horz' | 'vert' = 'vert';
  export let color: string;

  /** How to turn an item into a value */
  export let score = (item: Item) => 1;

  $: items = data.map((item) => {
    let time = zonedTimeToUtc(item.time, item.timezone);
    let key = formatDate(time, 'yyyy-MM-dd');
    return {
      key,
      time,
      item,
    };
  });

  $: boxData = group(items, (item) => item.key);

  $: boxes = range(0, weeks * 7, 1).map((dayDelta) => {
    let itemDate = subDays(new Date(), dayDelta);
    let day = Math.round(startOfDay(itemDate).valueOf() / 86400000);
    let key = formatDate(itemDate, 'yyyy-MM-dd');
    let data = boxData.get(key) ?? [];

    return {
      itemDate,
      day,
      key,
      data,
      score: data.reduce((acc, x) => acc + score(x.item), 0),
    };
  });
  $: console.log(boxes);
</script>

<LayerCake data={boxes} x="day" z="score" zDomain={[0, null]} zRange={['white', color]}>
  <Html>
    <BoxGridHtml {orientation} />
  </Html>
</LayerCake>
