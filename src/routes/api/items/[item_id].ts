import { RequestHandler } from '$lib/endpoints';
import * as itemDb from '$lib/db/items';
import { parseBody } from '$lib/form';
import { Item } from '$lib/items';
import { zonedTimeToUtc } from 'date-fns-tz';
import { parse as parseDate } from 'date-fns';

export const patch: RequestHandler<{}> = async ({ locals, params, request }) => {
  let input = await parseBody<Partial<Item & { date: string }>>(request);
  if (!input) {
    return { status: 400 };
  }

  let { date, ...item } = input;

  if (date && item.time && item.timezone) {
    let newTime = parseDate(`${date} ${item.time}`, 'yyyy-MM-dd HH:mm', new Date());
    item.time = zonedTimeToUtc(newTime, item.timezone).toISOString();
  }

  await itemDb.updateItem(locals.userId, +params.item_id, item);

  return {
    body: {},
  };
};
