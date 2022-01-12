import { RequestHandler, parseNumber } from '$lib/endpoints';
import * as itemDb from '$lib/db/items';
import { Item } from '$lib/items';
import { formDataToJson } from '$lib/form';
import { ReadOnlyFormData } from '@sveltejs/kit/types/helper';
import { DateGranularity, dateRange } from '$lib/dates';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const get: RequestHandler<unknown, Item[]> = async ({ locals, url }) => {
  let dateParam = url.searchParams.get('date');
  let baseDate: Date;
  if (dateParam && dateParam !== 'today') {
    baseDate = zonedTimeToUtc(dateParam, locals.timezone);
  } else {
    baseDate = new Date();
  }
  let granularity: DateGranularity = (url.searchParams.get('interval') as DateGranularity) || 'day';

  let { start, end } = dateRange(baseDate, granularity);

  let items = await itemDb.getItems({
    userId: locals.userId,
    startDate: start,
    endDate: end,
    trackableId: parseNumber(url.searchParams.get('trackableId')),
    timezone: locals.timezone,
  });

  return {
    body: items,
  };
};

export const post: RequestHandler<Item | ReadOnlyFormData, Item | null> = async ({
  locals,
  body,
}) => {
  let nowUtc = new Date().toISOString();
  let data = formDataToJson<Item>(body);

  let newItem: Omit<Item, 'item_id'> = {
    trackable_id: +data.trackable_id,
    time: data.time || nowUtc,
    timezone: locals.timezone,
    note: data.note || '',
    added: nowUtc,
    modified: nowUtc,
  };

  let item = await itemDb.addItemIfUnderDailyLimit(locals.userId, newItem);

  return {
    body: item,
  };
};
