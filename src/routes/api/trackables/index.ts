import { getAll, addTrackable } from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';
import { checkboxToBoolean, parseBody } from '$lib/form';
import { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals }) => {
  let result = await getAll(locals.userId);
  return {
    body: result,
  };
};

export const post: RequestHandler = async ({ locals, request }) => {
  let data = await parseBody<Trackable>(request, locals);
  if (!data) {
    return { status: 400 };
  }

  let item: Omit<Trackable, 'trackable_id'> = {
    name: data.name,
    sort: +data.sort,
    color: data.color,
    enabled: true,
    multiple_per_day: Boolean(checkboxToBoolean(data.multiple_per_day)),
  };

  let result = await addTrackable(locals.userId, item);
  return {
    body: result,
  };
};
