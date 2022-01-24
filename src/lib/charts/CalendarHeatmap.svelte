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

  $: boxes = range(0, weeks * 7, -1).map((dayDelta) => {
    let itemDate = subDays(new Date(), dayDelta);
    let day = Math.round(startOfDay(itemDate).valueOf() / 86400000);
    let key = formatDate(itemDate, 'yyyy-MM-dd');
    let data = boxData.get(key);

    return {
      itemDate,
      day,
      key,
      data: data ?? [],
    };
  });
</script>

<LayerCake
  data={boxes}
  x="day"
  z={(box) => box.data.length}
  zDomain={[0, null]}
  zRange={['white', 'green']}
>
  <Html>
    <BoxGridHtml {orientation} />
  </Html>
</LayerCake>
