import { RequestHandler } from '$lib/endpoints';
import { getAll, addTrackable } from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';
import { checkboxToBoolean, formDataToJson } from '$lib/form';

export const get: RequestHandler<unknown, Trackable[]> = async ({ locals }) => {
  let result = await getAll(locals.userId);
  return {
    body: result,
  };
};

export const post: RequestHandler<FormData, Trackable> = async ({ locals, body }) => {
  let data = formDataToJson<Trackable>(body);
  let item: Omit<Trackable, 'trackable_id'> = {
    name: data.name,
    sort: +data.sort,
    color: data.color,
    enabled: true,
    multiple_per_day: checkboxToBoolean(data.multiple_per_day),
  };

  let result = await addTrackable(locals.userId, item);
  return {
    body: result,
  };
};
