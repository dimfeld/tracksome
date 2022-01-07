import { RequestHandler } from '$lib/types';
import * as itemDb from '$lib/db/items';
import { toUserDate } from '$lib/dates';
import { Item } from '$lib/items';
import { formDataToJson } from '$lib/form';
import { ReadOnlyFormData } from '@sveltejs/kit/types/helper';

export const get: RequestHandler<unknown, Item[]> = async ({ locals, url }) => {
  let items = await itemDb.getItems({
    userId: locals.userId,
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
  });

  return {
    body: items,
  };
};

export const post: RequestHandler<Item | ReadOnlyFormData, Item> = async ({ locals, body }) => {
  let now = new Date();
  let nowUtc = now.toUTCString();

  let data = formDataToJson<Item>(body);
  let date = toUserDate(data.date ?? new Date(), locals.timezone);

  let newItem: Omit<Item, 'item_id'> = {
    trackable_id: +data.trackable_id,
    date,
    note: data.note || '',
    added: nowUtc,
    modified: nowUtc,
  };

  let item = await itemDb.addItem(locals.userId, newItem);

  return {
    status: 303,
    headers: {
      location: `/items/${item.item_id}`,
    },
  };
};
