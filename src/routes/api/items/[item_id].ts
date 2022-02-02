import * as itemDb from '$lib/db/items';
import { parseBody } from '$lib/form';
import { Item } from '$lib/items';
import { zonedTimeToUtc } from 'date-fns-tz';
import { parse as parseDate } from 'date-fns';
import { RequestHandler } from '@sveltejs/kit';

export const patch: RequestHandler = async ({ locals, params, request }) => {
  let item = await parseBody<Partial<Item>>(request, locals);
  if (!item) {
    return { status: 400 };
  }

  if (item.time && item.timezone) {
    let newTime = parseDate(item.time, `yyyy-MM-dd'T'HH:mm`, new Date());
    item.time = zonedTimeToUtc(newTime, item.timezone).toISOString();
  }

  await itemDb.updateItem(locals.userId, +params.item_id, item);

  return {
    body: {},
  };
};
