<script context="module" lang="ts">
  export interface ProcessedData<Data> {
    data: Data[];
    /** Days since epoch */
    day: number;
    key: string;
    itemDate: Date;
    score: number;
  }
</script>

<script lang="ts">
  import { Html, LayerCake } from 'layercake';
  import { format as formatDate, startOfDay, subDays } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';
  import { group, range } from 'd3';
  import BoxGridHtml from './parts/BoxGridHtml.svelte';
  import Tooltip from './parts/Tooltip.svelte';

  type Data = $$Generic<{ time: string | Date; timezone?: string }>;

  export let data: Data[];
  export let weeks = 4;
  export let gap: number | undefined = undefined;
  export let orientation: 'horz' | 'vert' = 'vert';
  export let color: string;

  /** How to turn an item into a value */
  export let score = (item: Data) => 1;
  export let label = (item: ProcessedData<Data>) => item.score.toString();

  $: items = data.map((item) => {
    let time = zonedTimeToUtc(item.time, item.timezone ?? 'UTC');
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

  let mouseEvent: CustomEvent<{ e: MouseEvent; score: number; data: ProcessedData<Data> }> | null =
    null;
</script>

<LayerCake data={boxes} x="day" z="score" zDomain={[0, null]} zRange={['white', color]}>
  <Html>
    <BoxGridHtml
      {orientation}
      {gap}
      on:mousemove={(e) => (mouseEvent = e)}
      on:mouseout={() => (mouseEvent = null)}
    />
    <Tooltip evt={mouseEvent} let:detail>
      {label(detail.data)}
    </Tooltip>
  </Html>
</LayerCake>
