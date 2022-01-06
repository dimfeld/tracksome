import { RequestHandler } from '$lib/types';
import { getAll, addTrackable } from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';

export const get: RequestHandler<unknown, Trackable[]> = async ({ locals }) => {
  let result = await getAll(locals.userId);
  return {
    body: result,
  };
};

export const post: RequestHandler<FormData, Trackable> = async ({ locals, body }) => {
  let item: Omit<Trackable, 'trackable_id'> = {
    name: body.get('name'),
    sort: +body.get('sort'),
    color: body.get('color'),
    enabled: true,
    multiple_per_day: Boolean(body.get('multiple_per_day')),
  };

  let result = await addTrackable(locals.userId, item);
  return {
    body: result,
  };
};
