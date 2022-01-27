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
  import {
    differenceInCalendarDays,
    endOfWeek,
    format as formatDate,
    isAfter,
    startOfDay,
    subDays,
  } from 'date-fns';
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

  const now = new Date();
  $: endOfWeekDays = differenceInCalendarDays(endOfWeek(now), now) + 1;
  $: boxes = range(weeks * 7 - endOfWeekDays, -endOfWeekDays, -1).map((dayDelta) => {
    let itemDate = subDays(now, dayDelta);
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

  let mouseEvent: CustomEvent<{ e: MouseEvent; score: number; data: ProcessedData<Data> }> | null =
    null;
</script>

<LayerCake data={boxes} x="day" z="score" zDomain={[0, null]} zRange={['white', color]}>
  <Html>
    <BoxGridHtml
      {orientation}
      {gap}
      placeholder={(box) => isAfter(box.itemDate, now)}
      on:mousemove={(e) => (mouseEvent = e)}
      on:mouseout={() => (mouseEvent = null)}
    />
    <Tooltip evt={mouseEvent} let:detail>
      {label(detail.data)}
    </Tooltip>
  </Html>
</LayerCake>
