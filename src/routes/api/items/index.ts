import { RequestHandler, parseNumber } from '$lib/endpoints';
import * as itemDb from '$lib/db/items';
import { Item } from '$lib/items';
import { formDataToJson } from '$lib/form';
import { ReadOnlyFormData } from '@sveltejs/kit/types/helper';

export const get: RequestHandler<unknown, Item[]> = async ({ locals, url }) => {
  let items = await itemDb.getItems({
    userId: locals.userId,
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
    trackableId: parseNumber(url.searchParams.get('trackableId')),
    timezone: locals.timezone,
  });

  return {
    body: items,
  };
};

export const post: RequestHandler<Item | ReadOnlyFormData, Item> = async ({ locals, body }) => {
  let nowUtc = new Date().toISOString();
  let data = formDataToJson<Item>(body);

  let newItem: Omit<Item, 'item_id'> = {
    trackable_id: +data.trackable_id,
    time: data.time || nowUtc,
    note: data.note || '',
    added: nowUtc,
    modified: nowUtc,
  };

  let item = await itemDb.addItemIfUnderDailyLimit(locals.userId, newItem, locals.timezone);

  return {
    body: item,
  };
};
