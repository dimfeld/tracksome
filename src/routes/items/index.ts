import { RequestHandler } from '$lib/types';
import * as dbItems from '$lib/db/items';
import { Item } from '$lib/items';

export const get: RequestHandler<unknown, Item[]> = async ({ locals }) => {
  let today = new Date();

  let items = await dbItems.getItems({
    userId: locals.userId,
  });

  return {
    body: items,
  };
};

export const post: RequestHandler = async ({ locals, body }) => {};
