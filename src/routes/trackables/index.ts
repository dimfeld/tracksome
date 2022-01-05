import { RequestHandler } from '$lib/types';
import { getAll, addTrackable } from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';

export const get: RequestHandler<unknown, Trackable[]> = async ({ locals }) => {
  let result = await getAll(locals.userId);
  return {
    body: result,
  };
};

export const post: RequestHandler<Trackable, Trackable> = async ({ locals, body }) => {
  let result = await addTrackable(locals.userId, body);
  return {
    body: result,
  };
};
