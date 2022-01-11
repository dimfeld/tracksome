import { RequestHandler } from '$lib/endpoints';
import * as itemDb from '$lib/db/items';
import { formDataToJson } from '$lib/form';
import { Item } from '$lib/items';

export const patch: RequestHandler<Item, {}> = async (request) => {
  let data = formDataToJson<Partial<Item>>(request.body);

  await itemDb.updateItem(request.locals.userId, +request.params.item_id, data);

  return {
    body: {},
  };
};
