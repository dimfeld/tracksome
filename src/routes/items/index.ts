import { RequestHandler } from '$lib/types';
import * as itemDb from '$lib/db/items';
import * as trackableDb from '$lib/db/trackable';
import { format as for, subMinutes } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Item } from '$lib/items';

export const get: RequestHandler<unknown, Item[]> = async ({ locals }) => {
  let today = new Date();

  let items = await itemDb.getItems({
    userId: locals.userId,
  });

  return {
    body: items,
  };
};

export const post: RequestHandler<FormData, Item> = async ({ locals, body }) => {
  let now = new Date();
  let nowUtc = now.toUTCString();

  let trackableId = +body.get('trackable_id');

  let date = body.get('date');
  if(date) {
    date = (new Date(date)).toUTCString();
  } else {
    // If we don't have a date from the user, try to 
    let utcOffset = locals.timezoneOffset;
    let localTime = subMinutes(new Date(), utcOffset);
    date = localTime.toUTCString();
  }

  let newItem: Omit<Item, 'item_id'> = {
    trackable_id: trackableId,
    date,
    note: body.get('note'),
    added: nowUtc,
    modified: nowUtc,
  };

  let item = await itemDb.addItem(locals.userId, newItem);

  return {
    status: 303,
    headers: {
      location: `/items/${item.item_id}`,
    }
  };
};
