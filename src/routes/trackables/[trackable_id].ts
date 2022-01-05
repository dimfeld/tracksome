import { RequestHandler } from '$lib/types';
import { getTrackable, updateTrackable, deleteTrackable } from '$lib/db/trackable';
import { Trackable } from '$lib/trackable';

export const get: RequestHandler<unknown, Trackable> = async ({ locals, params }) => {
  let result = await getTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  if (result) {
    return {
      body: result,
    };
  }
};

export const put: RequestHandler<Trackable, Trackable> = async ({ locals, body, params }) => {
  let result = await updateTrackable(locals.userId, {
    ...(body as Trackable),
    trackable_id: +params.trackable_id,
  });

  if (result) {
    return {
      body: result,
    };
  }
};

export const del: RequestHandler<unknown, object> = async ({ locals, params }) => {
  await deleteTrackable({ userId: locals.userId, trackableId: +params.trackable_id });
  return {
    body: {},
  };
};
