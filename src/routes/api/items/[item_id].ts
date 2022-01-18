import { RequestHandler } from '$lib/endpoints';
import * as itemDb from '$lib/db/items';
import { formDataToJson } from '$lib/form';
import { Item } from '$lib/items';
import { zonedTimeToUtc } from 'date-fns-tz';
import { parse as parseDate } from 'date-fns';

export const patch: RequestHandler<Item, {}> = async (request) => {
  let data = formDataToJson<Partial<Item & { date: string }>>(request.body);

  let { date, ...item } = data;

  if (date && item.time && item.timezone) {
    let newTime = parseDate(`${date} ${item.time}`, 'yyyy-MM-dd HH:mm', new Date());
    item.time = zonedTimeToUtc(newTime, item.timezone).toISOString();
  }

  await itemDb.updateItem(request.locals.userId, +request.params.item_id, item);

  return {
    body: {},
  };
};
