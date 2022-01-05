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
    enabled: body.get('enabled') === 'true',
    multiple_per_day: body.get('multiple_per_day') === 'true',
  };

  let result = await addTrackable(locals.userId, item);
  return {
    body: result,
  };
};
